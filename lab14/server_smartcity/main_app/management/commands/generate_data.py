from django.core.management.base import BaseCommand
from faker import Faker
import random

from main_app.models import Report
from django.contrib.auth import get_user_model

User = get_user_model()

fake = Faker('id_ID')


class Command(BaseCommand):
    help = "Generate fake reports data"

    def add_arguments(self, parser):
        parser.add_argument('num_records', type=int, help='Jumlah data')

    def handle(self, *args, **kwargs):
        num_records = kwargs['num_records']

        users = User.objects.all()

        if not users.exists():
            self.stdout.write(self.style.ERROR("Tidak ada user di database!"))
            return

        context_data = {
            'Jalan Rusak': {
                'titles': ['Lubang Besar di Tengah Jalan', 'Aspal Mengelupas', 'Jalan Bergelombang'],
                'desc': 'Ditemukan kerusakan jalan yang cukup dalam dan membahayakan pengguna.'
            },
            'Sampah': {
                'titles': ['Tumpukan Sampah Liar', 'Bau Menyengat', 'TPS Overload'],
                'desc': 'Sampah menumpuk selama beberapa hari dan mulai mengganggu aktivitas warga.'
            },
            'Lampu Mati': {
                'titles': ['Lampu Jalan Mati', 'Area Gelap', 'Lampu Tidak Berfungsi'],
                'desc': 'Lampu jalan tidak berfungsi sehingga area menjadi gelap dan rawan.'
            },
            'Drainase': {
                'titles': ['Saluran Mampet', 'Air Meluap', 'Banjir Kecil'],
                'desc': 'Drainase tersumbat menyebabkan air meluap saat hujan.'
            },
            'Keamanan': {
                'titles': ['Vandalisme', 'Pencurian Kabel', 'Gangguan Malam'],
                'desc': 'Perlu patroli tambahan karena adanya aktivitas mencurigakan.'
            }
        }

        status_choices = ['REPORTED', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED']

        for _ in range(num_records):
            category = random.choice(list(context_data.keys()))

            title = random.choice(context_data[category]['titles'])
            description = context_data[category]['desc']

            Report.objects.create(
                title=f"{title} - {fake.street_name()}",
                category=category,
                description=description,
                location=f"{fake.city()}, {fake.address()}",
                status=random.choice(status_choices),
                user=random.choice(users)
            )

        self.stdout.write(self.style.SUCCESS(f"Berhasil membuat {num_records} data laporan!"))