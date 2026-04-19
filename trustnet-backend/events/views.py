from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.permissions import IsVerifiedUser, IsOwnerOrAdmin
from core.trust_service import calculate_event_trust_score, calculate_user_trust_score
from .models import Event, Registration, EventTicket, EscrowPayment
from .serializers import EventSerializer, RegistrationSerializer, EventTicketSerializer, EscrowPaymentSerializer
from rest_framework import viewsets


class EventListCreateView(generics.ListCreateAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsVerifiedUser]

    def get_queryset(self):
        return Event.objects.filter(is_flagged=False).select_related('organizer')

    def get_serializer_context(self):
        return {'request': self.request}

    def perform_create(self, serializer):
        event = serializer.save(organizer=self.request.user)
        calculate_event_trust_score(event)
        calculate_user_trust_score(self.request.user)


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    queryset = Event.objects.all()

    def get_serializer_context(self):
        return {'request': self.request}


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_for_event(request, pk):
    try:
        event = Event.objects.get(pk=pk, is_flagged=False)
    except Event.DoesNotExist:
        return Response({'detail': 'Event not found or unavailable.'}, status=404)

    if Registration.objects.filter(event=event, user=request.user).exists():
        return Response({'detail': 'Already registered.'}, status=400)

    if event.max_attendees:
        if event.registrations.count() >= event.max_attendees:
            return Response({'detail': 'Event is full.'}, status=400)

    Registration.objects.create(event=event, user=request.user)
    calculate_event_trust_score(event)
    return Response({'detail': 'Successfully registered.'}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def report_event(request, pk):
    try:
        event = Event.objects.get(pk=pk)
    except Event.DoesNotExist:
        return Response({'detail': 'Event not found.'}, status=404)

    from trust.models import Report
    Report.objects.create(
        reporter=request.user,
        target_type='event',
        target_id=str(event.id),
        reason=request.data.get('reason', 'No reason provided'),
    )
    event.reports_count += 1
    event.save(update_fields=['reports_count'])
    calculate_event_trust_score(event)
    return Response({'detail': 'Report submitted.'}, status=status.HTTP_201_CREATED)

class EventTicketViewSet(viewsets.ModelViewSet):
    serializer_class = EventTicketSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return EventTicket.objects.all()

class EscrowPaymentViewSet(viewsets.ModelViewSet):
    serializer_class = EscrowPaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return EscrowPayment.objects.all().order_by('-created_at')
