import os
import sqlite3
import psycopg2

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sqlite_path = os.path.join(BASE_DIR, 'db.sqlite3')
print('Using SQLite:', sqlite_path)
print('Using POSTGRES_DB:', os.environ.get('POSTGRES_DB'))

conn_sql = sqlite3.connect(sqlite_path)
cur_sql = conn_sql.cursor()
cur_sql.execute(
    'SELECT id, title, category, description, location, status, created_at, updated_at FROM main_app_report ORDER BY id ASC'
)
rows = cur_sql.fetchall()
print('SQLite row count:', len(rows))
conn_sql.close()

conn_pg = psycopg2.connect(
    dbname=os.environ['POSTGRES_DB'],
    user=os.environ['POSTGRES_USER'],
    password=os.environ['POSTGRES_PASSWORD'],
    host=os.environ['POSTGRES_HOST'],
    port=os.environ['POSTGRES_PORT'],
)
cur_pg = conn_pg.cursor()
cur_pg.execute('DELETE FROM main_app_report')
print('Deleted existing rows in PostgreSQL main_app_report')

insert_sql = ('INSERT INTO main_app_report '
              '(id, title, category, description, location, status, created_at, updated_at, reporter_id) '
              'VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NULL)')
for row in rows:
    cur_pg.execute(insert_sql, row)

conn_pg.commit()
cur_pg.execute("SELECT setval(pg_get_serial_sequence('main_app_report','id'), (SELECT MAX(id) FROM main_app_report))")
conn_pg.commit()
cur_pg.execute('SELECT COUNT(*) FROM main_app_report')
count = cur_pg.fetchone()[0]
print('PostgreSQL row count after transfer:', count)
cur_pg.close()
conn_pg.close()