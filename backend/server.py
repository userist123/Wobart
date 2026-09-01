from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import logging
import secrets
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_ALGORITHM = 'HS256'

def get_jwt_secret() -> str:
    return os.environ['JWT_SECRET']

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {'sub': user_id, 'email': email, 'role': role, 'exp': datetime.now(timezone.utc) + timedelta(minutes=60), 'type': 'access'}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {'sub': user_id, 'exp': datetime.now(timezone.utc) + timedelta(days=7), 'type': 'refresh'}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get('access_token')
    if not token:
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail='Not authenticated')
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get('type') != 'access':
            raise HTTPException(status_code=401, detail='Invalid token type')
        user = await db.users.find_one({'_id': ObjectId(payload['sub'])})
        if not user:
            raise HTTPException(status_code=401, detail='User not found')
        user['_id'] = str(user['_id'])
        user.pop('password_hash', None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail='Token expired')
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail='Invalid token')

async def get_admin_user(request: Request) -> dict:
    user = await get_current_user(request)
    if user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail='Admin access required')
    return user

app = FastAPI(title='WOB ART API')
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in os.environ.get('CORS_ORIGINS', '').split(',') if origin.strip()],
    allow_credentials=True,
    allow_methods=['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allow_headers=['*'],
)

api_router = APIRouter(prefix='/api')
auth_router = APIRouter(prefix='/auth', tags=['auth'])
orders_router = APIRouter(prefix='/orders', tags=['orders'])
admin_router = APIRouter(prefix='/admin', tags=['admin'])
contact_router = APIRouter(prefix='/contact', tags=['contact'])

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class OrderCreate(BaseModel):
    car_brand: str
    car_model: str
    car_year: int
    car_plate: Optional[str] = None
    service_type: str
    finish_type: Optional[str] = None
    description: Optional[str] = None
    preferred_date: Optional[str] = None

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    estimated_price: Optional[float] = None
    notes: Optional[str] = None

class ContactForm(BaseModel):
    name: str
    email: EmailStr
    phone: str
    car_brand: Optional[str] = None
    car_model: Optional[str] = None
    car_year: Optional[str] = None
    service_type: str
    finish_type: Optional[str] = None
    message: Optional[str] = None
    photo_urls: list[str] = []

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@auth_router.post('/register')
async def register(data: UserRegister, response: Response):
    email = data.email.lower()
    if await db.users.find_one({'email': email}):
        raise HTTPException(status_code=400, detail='Email already registered')
    user_doc = {'email': email, 'password_hash': hash_password(data.password), 'name': data.name, 'phone': data.phone, 'role': 'user', 'created_at': datetime.now(timezone.utc).isoformat()}
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    response.set_cookie('access_token', create_access_token(user_id, email, 'user'), httponly=True, secure=os.environ.get('COOKIE_SECURE', 'true').lower() == 'true', samesite='lax', max_age=3600, path='/')
    response.set_cookie('refresh_token', create_refresh_token(user_id), httponly=True, secure=os.environ.get('COOKIE_SECURE', 'true').lower() == 'true', samesite='lax', max_age=604800, path='/')
    return {'id': user_id, 'email': email, 'name': data.name, 'phone': data.phone, 'role': 'user'}

@auth_router.post('/login')
async def login(data: UserLogin, request: Request, response: Response):
    email = data.email.lower()
    identifier = f"{request.client.host}:{email}"
    attempts = await db.login_attempts.find_one({'identifier': identifier})
    if attempts and attempts.get('count', 0) >= 5:
        lockout_until = attempts.get('lockout_until')
        if lockout_until and datetime.fromisoformat(lockout_until) > datetime.now(timezone.utc):
            raise HTTPException(status_code=429, detail='Too many failed attempts. Try again later.')
    user = await db.users.find_one({'email': email})
    if not user or not verify_password(data.password, user['password_hash']):
        await db.login_attempts.update_one({'identifier': identifier}, {'$inc': {'count': 1}, '$set': {'lockout_until': (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()}}, upsert=True)
        raise HTTPException(status_code=401, detail='Invalid email or password')
    await db.login_attempts.delete_one({'identifier': identifier})
    user_id = str(user['_id'])
    secure = os.environ.get('COOKIE_SECURE', 'true').lower() == 'true'
    response.set_cookie('access_token', create_access_token(user_id, email, user.get('role', 'user')), httponly=True, secure=secure, samesite='lax', max_age=3600, path='/')
    response.set_cookie('refresh_token', create_refresh_token(user_id), httponly=True, secure=secure, samesite='lax', max_age=604800, path='/')
    return {'id': user_id, 'email': user['email'], 'name': user['name'], 'phone': user.get('phone'), 'role': user.get('role', 'user')}

@auth_router.post('/logout')
async def logout(response: Response):
    response.delete_cookie('access_token', path='/')
    response.delete_cookie('refresh_token', path='/')
    return {'message': 'Logged out successfully'}

@auth_router.get('/me')
async def get_me(user: dict = Depends(get_current_user)):
    return user

@auth_router.post('/refresh')
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get('refresh_token')
    if not token:
        raise HTTPException(status_code=401, detail='No refresh token')
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get('type') != 'refresh':
            raise HTTPException(status_code=401, detail='Invalid token type')
        user = await db.users.find_one({'_id': ObjectId(payload['sub'])})
        if not user:
            raise HTTPException(status_code=401, detail='User not found')
        response.set_cookie('access_token', create_access_token(str(user['_id']), user['email'], user.get('role', 'user')), httponly=True, secure=os.environ.get('COOKIE_SECURE', 'true').lower() == 'true', samesite='lax', max_age=3600, path='/')
        return {'message': 'Token refreshed'}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail='Refresh token expired')
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail='Invalid token')

@auth_router.post('/forgot-password')
async def forgot_password(data: ForgotPasswordRequest):
    email = data.email.lower()
    user = await db.users.find_one({'email': email})
    if user:
        token = secrets.token_urlsafe(32)
        await db.password_reset_tokens.insert_one({'token': token, 'user_id': str(user['_id']), 'email': email, 'expires_at': datetime.now(timezone.utc) + timedelta(hours=1), 'used': False})
        logging.info('Password reset token created for user %s', user['_id'])
    return {'message': 'If the email exists, a reset link has been sent'}

@auth_router.post('/reset-password')
async def reset_password(data: ResetPasswordRequest):
    reset_doc = await db.password_reset_tokens.find_one({'token': data.token, 'used': False})
    if not reset_doc:
        raise HTTPException(status_code=400, detail='Invalid or expired reset token')
    expires_at = reset_doc['expires_at']
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail='Reset token expired')
    await db.users.update_one({'_id': ObjectId(reset_doc['user_id'])}, {'$set': {'password_hash': hash_password(data.new_password)}})
    await db.password_reset_tokens.update_one({'token': data.token}, {'$set': {'used': True}})
    return {'message': 'Password reset successfully'}

@contact_router.post('', status_code=201)
async def create_contact_request(data: ContactForm, request: Request):
    now = datetime.now(timezone.utc).isoformat()
    doc = data.model_dump()
    doc.update({'status': 'NEW', 'source': 'website', 'ip_address': request.client.host if request.client else None, 'created_at': now, 'updated_at': now})
    result = await db.contact_requests.insert_one(doc)
    return {'id': str(result.inserted_id), 'status': doc['status'], 'created_at': now}

@orders_router.post('/', status_code=201)
async def create_order(data: OrderCreate, user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    order_count = await db.orders.count_documents({})
    order_number = f"WOB-{datetime.now().year}-{str(order_count + 1).zfill(4)}"
    doc = {'order_number': order_number, 'user_id': user['_id'], 'user_email': user['email'], 'user_name': user['name'], **data.model_dump(), 'status': 'PENDING', 'estimated_price': None, 'deposit_paid': False, 'deposit_amount': None, 'notes': None, 'created_at': now, 'updated_at': now}
    result = await db.orders.insert_one(doc)
    doc['_id'] = str(result.inserted_id)
    return doc

@orders_router.get('/')
async def get_my_orders(user: dict = Depends(get_current_user)):
    orders = await db.orders.find({'user_id': user['_id']}, {'_id': 0}).sort('created_at', -1).to_list(100)
    for order in orders: order['id'] = order['order_number']
    return orders

@orders_router.get('/{order_number}')
async def get_order(order_number: str, user: dict = Depends(get_current_user)):
    query = {'order_number': order_number}
    if user.get('role') != 'admin': query['user_id'] = user['_id']
    order = await db.orders.find_one(query, {'_id': 0})
    if not order: raise HTTPException(status_code=404, detail='Order not found')
    order['id'] = order['order_number']
    return order

@admin_router.get('/orders')
async def admin_get_orders(status: Optional[str] = None, admin: dict = Depends(get_admin_user)):
    query = {'status': status} if status else {}
    orders = await db.orders.find(query, {'_id': 0}).sort('created_at', -1).to_list(500)
    for order in orders: order['id'] = order['order_number']
    return orders

@admin_router.get('/contact-requests')
async def admin_get_contact_requests(status: Optional[str] = None, admin: dict = Depends(get_admin_user)):
    query = {'status': status} if status else {}
    requests = await db.contact_requests.find(query, {'ip_address': 0}).sort('created_at', -1).to_list(500)
    for item in requests: item['id'] = str(item.pop('_id'))
    return requests

@admin_router.patch('/contact-requests/{request_id}')
async def admin_update_contact_request(request_id: str, status: str, admin: dict = Depends(get_admin_user)):
    allowed = {'NEW', 'CONTACTED', 'QUOTED', 'WON', 'LOST', 'ARCHIVED'}
    if status not in allowed: raise HTTPException(status_code=400, detail='Invalid status')
    try: oid = ObjectId(request_id)
    except Exception: raise HTTPException(status_code=400, detail='Invalid request id')
    result = await db.contact_requests.update_one({'_id': oid}, {'$set': {'status': status, 'updated_at': datetime.now(timezone.utc).isoformat()}})
    if result.matched_count == 0: raise HTTPException(status_code=404, detail='Request not found')
    return {'id': request_id, 'status': status}

@admin_router.patch('/orders/{order_number}')
async def admin_update_order(order_number: str, data: OrderUpdate, admin: dict = Depends(get_admin_user)):
    update_data = {key: value for key, value in data.model_dump().items() if value is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    result = await db.orders.update_one({'order_number': order_number}, {'$set': update_data})
    if result.matched_count == 0: raise HTTPException(status_code=404, detail='Order not found')
    order = await db.orders.find_one({'order_number': order_number}, {'_id': 0})
    order['id'] = order['order_number']
    return order

@admin_router.get('/users')
async def admin_get_users(admin: dict = Depends(get_admin_user)):
    users = await db.users.find({}, {'password_hash': 0}).to_list(500)
    for user in users:
        user['_id'] = str(user['_id'])
        user['id'] = user['_id']
    return users

@admin_router.get('/stats')
async def admin_get_stats(admin: dict = Depends(get_admin_user)):
    total_orders = await db.orders.count_documents({})
    pending_orders = await db.orders.count_documents({'status': 'PENDING'})
    total_users = await db.users.count_documents({})
    total_contacts = await db.contact_requests.count_documents({})
    return {'total_orders': total_orders, 'pending_orders': pending_orders, 'total_users': total_users, 'total_contacts': total_contacts}

app.include_router(api_router)
app.include_router(auth_router, prefix='/api')
app.include_router(orders_router, prefix='/api')
app.include_router(admin_router, prefix='/api')
app.include_router(contact_router, prefix='/api')

@app.get('/')
async def root():
    return {'name': 'WOB ART API', 'status': 'ok'}
