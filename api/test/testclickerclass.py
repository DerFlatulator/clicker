# from django.contrib.auth import models as auth_models
from rest_framework import test


class ClickerClassTest(test.APITestCase):

    def setUp(self):
        self.factory = test.APIRequestFactory
        # auth_models.User

    def test_Lucas_can_add(self):
            self.assertEqual(1 + 1, 2, msg="1+1 should probably equal 2...")