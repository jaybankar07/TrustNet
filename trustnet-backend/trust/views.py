from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.permissions import IsAdminRole
from core.trust_service import calculate_user_trust_score, calculate_event_trust_score
from .models import Report
from .serializers import ReportSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def file_report(request):
    serializer = ReportSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    report = serializer.save(reporter=request.user)

    # Side effects: recalculate trust for the target
    target_type = report.target_type
    target_id = report.target_id

    if target_type == 'user':
        from accounts.models import CustomUser
        try:
            target_user = CustomUser.objects.get(pk=target_id)
            target_user.reports_count += 1
            target_user.save(update_fields=['reports_count'])
            calculate_user_trust_score(target_user)
        except CustomUser.DoesNotExist:
            pass

    elif target_type == 'event':
        from events.models import Event
        try:
            event = Event.objects.get(pk=target_id)
            event.reports_count += 1
            event.save(update_fields=['reports_count'])
            calculate_event_trust_score(event)
        except Event.DoesNotExist:
            pass

    elif target_type == 'post':
        from feed.models import Post
        try:
            post = Post.objects.get(pk=target_id)
            post.reports_count += 1
            post.save(update_fields=['reports_count'])
        except Post.DoesNotExist:
            pass

    elif target_type == 'company':
        from companies.models import Company
        try:
            company = Company.objects.get(pk=target_id)
            company.reports_count += 1
            company.save(update_fields=['reports_count'])
        except Company.DoesNotExist:
            pass

    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_chat_assistant(request):
    import requests
    import os
    message = request.data.get('message', '').strip()
    
    API_KEY = os.environ.get('GEMINI_API_KEY', "AIzaSyDcrI7R4QcJ9ZXa_UEB9KRrVuuec0EeAEc")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"

    data = {
        "contents": [{"parts": [{"text": message}]}],
        "systemInstruction": {
            "parts": [{"text": f"You are the TrustNet Assistant. TrustNet is a highly-verified professional networking and jobs platform. The user's name is {request.user.name}. You should be extremely helpful, professional, but concise."}]
        }
    }

    try:
        resp = requests.post(url, json=data, timeout=10)
        if resp.ok:
            res_json = resp.json()
            reply = res_json['candidates'][0]['content']['parts'][0]['text']
        else:
            reply = "I'm having trouble understanding that right now (API error)."
    except Exception as e:
        reply = "I am currently offline or experiencing a network error."
        
    return Response({"reply": reply})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_optimization_tips(request):
    import requests
    import os
    
    API_KEY = os.environ.get('GEMINI_API_KEY', "AIzaSyDcrI7R4QcJ9ZXa_UEB9KRrVuuec0EeAEc")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"

    user_context = f"Name: {request.user.name}, Role: {request.user.role}, Bio: {request.user.bio}, TrustScore: {request.user.trust_score}"
    
    data = {
        "contents": [{"parts": [{"text": f"Review this professional networking profile: {user_context}."}]}],
        "systemInstruction": {
            "parts": [{"text": "You are the TrustNet AI Profile Coach. Give 3 short, actionable, bullet-pointed tips to help this user improve their profile trust score, get more connections, or stand out. Output must be raw text with bullet points, no markdown formatting like bold/italics, and concise."}]
        }
    }

    try:
        resp = requests.post(url, json=data, timeout=10)
        if resp.ok:
            res_json = resp.json()
            reply = res_json['candidates'][0]['content']['parts'][0]['text']
        else:
            reply = "Complete your bio to get started.\nVerify your company.\nUpload a profile picture."
    except Exception:
        reply = "Complete your bio to get started.\nVerify your company.\nUpload a profile picture."
        
    return Response({"tips": reply})


class AdminReportListView(generics.ListAPIView):
    serializer_class = ReportSerializer
    permission_classes = [IsAdminRole]
    queryset = Report.objects.select_related('reporter').order_by('-created_at')
    filterset_fields = ['target_type']
    search_fields = ['reason', 'target_id']
