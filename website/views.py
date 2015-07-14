from django.contrib import auth
from django.core.urlresolvers import reverse_lazy
from django.views import generic
from django.conf import settings
from django.contrib import messages

from api import models

from forms import RegistrationForm, LoginForm

from braces import views


class LandingView(generic.TemplateView, views.MessageMixin):
    template_name = 'landing.html'

    def get_context_data(self, **kwargs):
        context = super(LandingView, self).get_context_data(**kwargs)
        context['class_list'] = models.ClickerClass.objects.all()[:10]
        return context


class SignUpView(generic.CreateView, views.AnonymousRequiredMixin, views.FormValidMessageMixin):
    form_class = RegistrationForm
    model = settings.AUTH_USER_MODEL
    template_name = 'signup.html'
    form_valid_message = 'All information is valid.'

    def get_success_url(self):
        self.messages.success("Account created. You may now log in.")
        return reverse_lazy('home')


class LoginView(generic.FormView, views.FormMessagesMixin):
    form_class = LoginForm
    success_url = reverse_lazy('home')
    template_name = 'login.html'
    form_valid_message = 'All information is valid.'

    def form_valid(self, form):
        username = form.cleaned_data['username']
        password = form.cleaned_data['password']
        user = auth.authenticate(username=username, password=password)

        if user is not None and user.is_active:
            auth.login(self.request, user)
            self.messages.success("Welcome, {}. You've been logged in.".format(username))
            return super(LoginView, self).form_valid(form)
        else:
            return self.form_invalid(form)


class LogOutView(generic.RedirectView, views.LoginRequiredMixin, views.MessageMixin):
    url = reverse_lazy('home')
    permanent = False

    def get(self, request, *args, **kwargs):
        auth.logout(request)
        messages.warning(request, "You've been logged out.")
        return super(LogOutView, self).get(request, *args, **kwargs)