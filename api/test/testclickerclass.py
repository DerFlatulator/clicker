# from django.contrib.auth import models as auth_models
from rest_framework import test, status


class ClickerClassTest(test.APITestCase):

    def setUp(self):
        self.factory = test.APIRequestFactory()

    def test_can_create(self):
        response = self.client.post('/api/class/', {
            'class_name': 'a', 'long_name': 'A'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED,
                         msg='ClickerClass was not created')

    def test_class_name_unique_POST(self):
        response1 = self.client.post('/api/class/', {
            'class_name': 'b', 'long_name': 'B1'
        })
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)

        response2 = self.client.post('/api/class/', {
            'class_name': 'b', 'long_name': 'B2'
        })
        self.assertEqual(response2.status_code, status.HTTP_400_BAD_REQUEST,
                         msg='Duplicate class_name was not prevented [POST]')

    def test_class_name_unique_PATCH(self):
        response1 = self.client.post('/api/class/', {
            'class_name': 'c', 'long_name': 'C'
        })
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)

        response2 = self.client.post('/api/class/', {
            'class_name': 'd', 'long_name': 'D'
        })
        self.assertEqual(response2.status_code, status.HTTP_201_CREATED)
        self.assertTrue('url' in response2.data,
                        msg='An url field should be returned')
        url2 = response2.data['url']

        response3 = self.client.put(url2, {
            'class_name': 'c'
        })
        self.assertEqual(response3.status_code, status.HTTP_400_BAD_REQUEST,
                         msg='Duplicate class_name was not prevented [PATCH]')

    def test_can_DELETE(self):
        response1 = self.client.post('/api/class/', {
            'class_name': 'e', 'long_name': 'E'
        })
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)
        url1 = response1.data['url']

        response2 = self.client.delete(url1)
        self.assertEqual(response2.status_code, status.HTTP_204_NO_CONTENT,
                         msg='Unable to delete a ClickerClass')

    def test_DELETE_invalid_url_pk(self):
        response1 = self.client.delete('/api/class/9999999999/')
        self.assertEqual(response1.status_code, status.HTTP_404_NOT_FOUND,
                         msg='Expected 404 Error, Got {}'.format(response1.status_code))

    def test_GET(self):
        response1 = self.client.post('/api/class/', {
            'class_name': 'f', 'long_name': 'F'
        })
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)
        url1 = response1.data['url']

        response2 = self.client.get('/api/class/')
        self.assertEqual(response2.status_code, status.HTTP_200_OK,
                         msg='GET operation failed, got code: {}'.format(response2.status_code))
        data2 = None
        for result in response2.data['results']:
            if result['url'] == url1:
                data2 = result
        self.assertIsNotNone(data2, msg='POSTed object not found in GET index')

        response3 = self.client.get(url1)
        self.assertEqual(response3.status_code, status.HTTP_200_OK,
                         msg='GET operation failed, got code: {}'.format(response2.status_code))
        self.assertEqual(data2, response3.data)
