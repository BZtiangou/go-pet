from .models import CustomUser
from .serializers import modifyPhoneSerializer,modifyEmailSerializer,modifyPasswordSerializer,UserLoginSerializer,UserSerializer,IsPasswordSerializer,ResetSerializer,modifyNameSerializer
from .serializers import modifyGenderSerializer,userInfoSerializer,CheckPhoneSerializer
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils.crypto import get_random_string
from rest_framework.permissions import IsAdminUser
from .models import CustomUser
from .serializers import ExperimentParticipantSerializer,AdminUpdateSerializer
from .tasks import send_password_reset_email  # 使用相对路径导入
import requests
import json
import os
import dotenv
import redis
from datetime import timedelta
# from openai import OpenAI

# 连接 Redis
redis_client = redis.StrictRedis(host='localhost', port=6379, db=0)

class GetUserInfoByNameApi(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        # 从请求体中获取 name 字段
        name = request.data.get("name")
        
        if not name:
            return Response({"message": "Name field is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # 根据提供的姓名查找用户
            user = CustomUser.objects.get(name=name)
        except CustomUser.DoesNotExist:
            return Response({"message": "User not found with the given name"}, status=status.HTTP_400_BAD_REQUEST)

        # 序列化用户信息
        seri = userInfoSerializer(user)
        return Response(seri.data)

class AdminUpdateProfileApi(APIView):
    """
    管理员修改个人信息 API（使用 `POST` 方法）
    仅 `is_staff=True` 或 `is_superuser=True` 的用户可以修改个人信息
    """
    permission_classes = [IsAdminUser]

    def post(self, request):
        """管理员修改个人信息"""
        user = request.user

        if not user.is_staff and not user.is_superuser:
            return Response({"message": "Permission Denied"}, status=status.HTTP_403_FORBIDDEN)

        # 过滤空值，确保只更新提供的字段
        update_fields = {key: value for key, value in request.data.items() if value}
        if not update_fields:
            return Response({"message": "No fields provided for update"}, status=status.HTTP_400_BAD_REQUEST)

        # 进行部分更新
        serializer = AdminUpdateSerializer(user, data=update_fields, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile updated successfully", "data": serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class AdminLoginApi(APIView):
    permission_classes = []

    def post(self, request: Request) -> Response:
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            user = get_user_model().objects.get(username=serializer.validated_data["username"])
        except ObjectDoesNotExist:
            return Response({"message": "User not registered"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not user.check_password(serializer.validated_data["password"]):
            return Response({"message": "User login failed, please check your account password"}, status=status.HTTP_400_BAD_REQUEST)
        
        if user.is_staff:  
            refresh: RefreshToken = RefreshToken.for_user(user) 
            return Response({
                "username": user.username,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "expire": refresh.access_token.payload["exp"] - refresh.access_token.payload["iat"],
            })
        else:
            return Response({"message": "User is not an admin"}, status=status.HTTP_401_UNAUTHORIZED)


class getUserInfoApi(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        username = request.user.username
        user = get_object_or_404(CustomUser, username=username)
        seri=userInfoSerializer(user)
        return Response(seri.data)

class AllUserNameApi(APIView):
    permission_classes = [IsAdminUser]  # 确保只有管理员可以访问
    def get(self, request):
        users = CustomUser.objects.all()
        # usernames = [user.username for user in users]
        # return Response(usernames)
        serializer = userInfoSerializer(users, many=True)  
        return Response(serializer.data)  

class adminGetUserInfoApi(APIView):
    permission_classes = [IsAdminUser]
    def post(self, request):
        username = request.data.get('username')
        user = get_object_or_404(CustomUser, username=username)
        seri=userInfoSerializer(user)
        return Response(seri.data)

#注册api
class UserRegisterApi(APIView):
    permission_classes = []
    def post(self, request: Request) -> Response:
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registration succeeded"}, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class UserLoginApi(APIView):
    permission_classes = []
    def post(self, request: Request) -> Response:
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = get_user_model().objects.get(username=serializer.validated_data["username"])
        except ObjectDoesNotExist:
            return Response({"message": "User not registered"}, status=status.HTTP_400_BAD_REQUEST)
        
        if user.check_password(serializer.validated_data["password"]):
            refresh: RefreshToken = RefreshToken.for_user(user)  # 生成refresh token
            return Response({
                "username": user.username,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "expire": refresh.access_token.payload["exp"] - refresh.access_token.payload["iat"],
            })
        else:
            return Response({"message": "User login failed, please check your account password"})
        
dotenv.load_dotenv(dotenv_path= "/var/www/gps_inf/.env", verbose=True)
# API配置
DeepSeek_API_Key = os.environ.get("DeepSeek_API_Key")
DeepSeek_API_URL = "https://api.deepseek.com/v1/chat/completions"

# 实现多轮对话
# client = OpenAI(api_key="<DeepSeek API Key>", base_url="https://api.deepseek.com")

# # Round 1
# messages = [{"role": "user", "content": "What's the highest mountain in the world?"}]
# response = client.chat.completions.create(
#     model="deepseek-chat",
#     messages=messages
# )

# messages.append(response.choices[0].message)
# print(f"Messages Round 1: {messages}")

# # Round 2
# messages.append({"role": "user", "content": "What is the second?"})
# response = client.chat.completions.create(
#     model="deepseek-chat",
#     messages=messages
# )

# messages.append(response.choices[0].message)
# print(f"Messages Round 2: {messages}")
def call_deepseek_chat(prompt, model="deepseek-chat", temperature=0.3, max_tokens=2048):
    """
    调用DeepSeek聊天API
    
    参数:
    prompt : str - 用户输入的提示内容
    model : str - 使用的模型名称(默认: deepseek-chat)
    temperature : float - 生成多样性(默认: 0.3)
    max_tokens : int - 最大生成token数(默认: 2048)
    
    返回:
    str - API返回内容或错误信息
    """
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {DeepSeek_API_Key}"
    }
    
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": temperature,
        "max_tokens": max_tokens
    }
    
    try:
        response = requests.post(
            DeepSeek_API_URL,
            headers=headers,
            data=json.dumps(payload)
        )
        response.raise_for_status()
        result = response.json()
        return result["choices"][0]["message"]["content"] if result.get("choices") else "Error: No response content"
        
    except requests.exceptions.HTTPError as http_err:
        return f"HTTP error ({http_err.response.status_code}): {http_err.response.text}"
    except Exception as err:
        return f"Request failed: {str(err)}"



class callDeepSeekApi(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        """
        处理用户请求的API端点
        请求体格式：{"prompt": "你的问题"}
        """
        try:
            # 参数验证
            if not (user_prompt := request.data.get("prompt")):
                return Response(
                    {"error": "Missing required field 'prompt'"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            username=request.user.username
            user=CustomUser.objects.get(username=username)
            user.call_times+=1
            if(user.call_times > 10000000000):
                return Response(
                    {
                        "status": "Failure",
                        "content": "There have been too many inquiries today. Refresh count at 0 o'clock every day",
                        "model": "System"
                    },
                    status=status.HTTP_200_OK
                )

            user.save()  # 必须调用save()才能保存到数据库
            # 调用API函数
            api_response = call_deepseek_chat(user_prompt)  # 直接调用本地函数

            # 错误处理
            if any(keyword in api_response.lower() for keyword in ["error", "failed"]):
                return Response(
                    {"error": api_response},
                    status=status.HTTP_502_BAD_GATEWAY  # 更准确的错误状态码
                )

            # 成功响应
            return Response(
                {
                    "status": "success",
                    "content": api_response,
                    "model": "deepseek-chat"
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {"error": f"Server error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# 检查手机号码是否正确
class checkphoneApi(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request):
        serializer = CheckPhoneSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone_number = serializer.validated_data["phone_number"]
        username = request.user.username

        try:
            user = get_user_model().objects.get(phone_number=phone_number, username=username)
            return Response("Accept", status=status.HTTP_200_OK)
        except get_user_model().DoesNotExist:
            return Response("手机号码不存在", status=status.HTTP_400_BAD_REQUEST)


# 令牌发送api 通用api
class Is_PasswordApi(APIView):
    permission_classes = []
    
    def post(self, request: Request) -> Response:
        serializer = IsPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        username = serializer.validated_data["username"]
        email = serializer.validated_data["email"]
        
        try:
            user = get_user_model().objects.get(username=username, email=email)
        except get_user_model().DoesNotExist:
            return Response(
                {"detail": "用户不存在或邮箱不匹配"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 生成6位验证码
        token_value = get_random_string(length=6, allowed_chars='0123456789')
        redis_key = f"pwd_reset:{user.id}"
        redis_client.setex(
            name=redis_key,
            time=timedelta(minutes=2),
            value=token_value
        )
        
        # 异步发送邮件
        send_password_reset_email.delay(
            email=user.email,
            token=token_value
        )
        
        return Response({
            "detail": "验证码已发送至您的注册邮箱，请查收！"
        })

class ResetPasswordApi(APIView):
    permission_classes = []
    
    def post(self, request: Request) -> Response:
        serializer = ResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        username = serializer.validated_data['username']
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['password']
        
        try:
            user = get_user_model().objects.get(username=username)
        except get_user_model().DoesNotExist:
            return Response(
                {"detail": "用户不存在"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 从Redis获取验证码
        redis_key = f"pwd_reset:{user.id}"
        stored_token = redis_client.get(redis_key)
        
        if not stored_token:
            return Response(
                {"detail": "验证码已过期或未发送"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if str(stored_token) != str(token):
            return Response(
                {"detail": "验证码错误"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 验证通过后执行操作
        user.set_password(new_password)
        user.save()
        
        # 删除已使用的验证码
        redis_client.delete(redis_key)
        
        return Response({
            "detail": "密码重置成功"
        })

class modifyPasswordApi(APIView):
    permission_classes = [IsAuthenticated]
    def post(self,request:Request) -> Response:
        serializer = modifyPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        username = request.user.username
        if get_user_model().objects.get(username=username):
            user = get_user_model().objects.get(username=username)
            if user.check_password(serializer.validated_data['old_password']):
                user.set_password(serializer.validated_data['password'])
                user.save()
                return Response({
                    f"Your password has been changed successfully. Please log in again"
                })
        return Response({"The user name does not exist"},status=status.HTTP_400_BAD_REQUEST)


# 无安全验证版本
class modifyEmailApi(APIView):
    permission_classes = [IsAuthenticated]
    def post(self,request:Request) -> Response:
        serializer = modifyEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        username = request.user.username
        if get_user_model().objects.get(username=username):
            user = get_user_model().objects.get(username=username)
            user.email= serializer.validated_data['email']
            user.save()
            return Response("email modification successful")
        return Response({"The user name does not exist"},status=status.HTTP_400_BAD_REQUEST)

class modifyPhoneApi(APIView):
    permission_classes = [IsAuthenticated]
    def post(self,request:Request) -> Response:
        serializer = modifyPhoneSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        username = request.user.username
        if get_user_model().objects.get(username=username):
            user = get_user_model().objects.get(username=username)
            user.phone_number= serializer.validated_data['phone_number']
            user.save()
            return Response("phone modification successful")
        return Response({"The user name does not exist"},status=status.HTTP_400_BAD_REQUEST)

        
class modifyGenderApi(APIView):
    permission_classes = [IsAuthenticated]
    def post(self,request:Request) -> Response:
        serializer = modifyGenderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        username = request.user.username
        if get_user_model().objects.get(username=username):
            user = get_user_model().objects.get(username=username)
            user.gender= serializer.validated_data['gender']
            user.save()
            return Response("Gender modification successful")
        return Response({"The user name does not exist"},status=status.HTTP_400_BAD_REQUEST)

class modifyNameApi(APIView):
    permission_classes = [IsAuthenticated]
    def post(self,request:Request) -> Response:
        serializer = modifyNameSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        username = request.user.username
        if get_user_model().objects.get(username=username):
            user = get_user_model().objects.get(username=username)
            user.name= serializer.validated_data['name']
            user.save()
            return Response("Name changed successfully")
        return Response({"The user name does not exist"},status=status.HTTP_400_BAD_REQUEST)
    
class ManageExperimentParticipantsApi(APIView):
    """
    管理实验参与者 API
    允许：
    1. 移除实验参与者
    2. 设置某个用户为 `staff`
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """获取当前管理员的实验参与者列表"""
        if not request.user.is_staff and not request.user.is_superuser:
            return Response({"message": "Permission Denied"}, status=status.HTTP_403_FORBIDDEN)
        
        participants = CustomUser.objects.filter(exp_id=request.user.exp_id)
        serializer = ExperimentParticipantSerializer(participants, many=True)
        return Response(serializer.data)

    def delete(self, request, user_id):
        """移除实验参与者"""
        if not request.user.is_staff and not request.user.is_superuser:
            return Response({"message": "Permission Denied"}, status=status.HTTP_403_FORBIDDEN)

        user = get_object_or_404(CustomUser, id=user_id)
        if user.exp_id != request.user.exp_id:
            return Response({"message": "You cannot remove users from other experiments"}, status=status.HTTP_403_FORBIDDEN)

        user.exp_id = -1  
        user.exp_title = ""
        user.exp_state = "inactive"
        user.save()
        
        return Response({"message": f"User {user.username} removed from the experiment"}, status=status.HTTP_200_OK)

    def patch(self, request, user_id):
        """修改用户权限（设置 `staff` 角色）"""
        if not request.user.is_staff and not request.user.is_superuser:
            return Response({"message": "Permission Denied"}, status=status.HTTP_403_FORBIDDEN)

        user = get_object_or_404(CustomUser, id=user_id)
        if user.exp_id != request.user.exp_id:
            return Response({"message": "You cannot modify users from other experiments"}, status=status.HTTP_403_FORBIDDEN)

        user.is_staff = request.data.get("is_staff", False)
        user.save()
        
        return Response({"message": f"User {user.username} role updated"}, status=status.HTTP_200_OK)