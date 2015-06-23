from django.shortcuts import render
from django.http import HttpResponse, HttpResponseServerError
from django.contrib.sessions.models import Session
from django.contrib.auth.models import User

import redis


def app(request):
    return render(request, 'observer/index.html', {})


"""
def socket(request):
    try:
        # Get user session id
        session = Session.objects.get(session_key=request.POST.get('sessionid'))
        user_id = session.get_decoded().get('_auth_user_id')
        user = User.objects.get(id=user_id)

        # Get message
        print request.POST.get('message')

        r = redis.StrictRedis(host='localhost', port=6379, db=0)
        r.publish('observer', 'TEST')

        return HttpResponse("Success")
    except Exception, e:
        return HttpResponseServerError(str(e))
"""