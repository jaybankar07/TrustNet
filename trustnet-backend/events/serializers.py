from rest_framework import serializers
from accounts.serializers import PublicUserSerializer
from .models import Event, Registration, EventTicket, EscrowPayment


class EventSerializer(serializers.ModelSerializer):
    organizer = PublicUserSerializer(read_only=True)
    registration_count = serializers.SerializerMethodField()
    is_registered = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = ['id', 'organizer', 'title', 'category', 'description', 'date', 'location',
                  'is_online', 'max_attendees', 'trust_score', 'reports_count',
                  'is_flagged', 'registration_count', 'is_registered', 'created_at']
        read_only_fields = ['id', 'organizer', 'trust_score', 'reports_count',
                            'is_flagged', 'created_at']

    def get_registration_count(self, obj):
        return obj.registrations.count()

    def get_is_registered(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.registrations.filter(user=request.user).exists()
        return False


class RegistrationSerializer(serializers.ModelSerializer):
    user = PublicUserSerializer(read_only=True)
    
    class Meta:
        model = Registration
        fields = ['id', 'event', 'user', 'registered_at']
        read_only_fields = ['id', 'registered_at']

class EventTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventTicket
        fields = '__all__'

class EscrowPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EscrowPayment
        fields = '__all__'
        read_only_fields = ['status', 'created_at', 'registration', 'amount']
