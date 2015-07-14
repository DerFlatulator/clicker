from django.contrib.auth.forms import UserCreationForm, AuthenticationForm

from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, HTML


def submit_button(text):
    # TODO refactor in to `layout.Field()` with custom-template.html
    return HTML("""
    <div class="row">
        <div class="col m6 offset-m6 offset-s4">
            <br />
            <button class="btn-large waves-effect waves-light" type="submit" name="action">
              {}
              <i class="material-icons right">send</i>
            </button>
        </div>
    </div>""".format(text))


class RegistrationForm(UserCreationForm):
    def __init__(self, *args, **kwargs):
        super(RegistrationForm, self).__init__(*args, **kwargs)

        self.helper = FormHelper()
        self.helper.layout = Layout(
            'username',
            'email',
            'password1',
            'password2',
            submit_button('Register')
        )


class LoginForm(AuthenticationForm):
    def __init__(self, *args, **kwargs):
        super(LoginForm, self).__init__(*args, **kwargs)

        self.helper = FormHelper()
        self.helper.layout = Layout(
            'username',
            'password',
            submit_button('login')
        )