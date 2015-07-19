from rest_framework import permissions
from django.core import exceptions

from . import models

class DeviceIsRegisteredPermission(permissions.BasePermission):

    def has_permission(self, request, view):
        if request.user.is_staff or view.action == 'create':
            return True

        return 'device_id' in request.session

    def has_object_permission(self, request, view, obj):
        try:
            device = models.RegisteredDevice.objects.get(device_id=request.session['device_id'])
            if isinstance(obj, models.RegisteredDevice):
                return obj.device_id == device.device_id
            else:
                return False
        except exceptions.ObjectDoesNotExist:
            return False
