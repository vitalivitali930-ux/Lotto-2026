import os
import json
from telethon.sync import TelegramClient

# Данные из "Тайника" GitHub
api_id = int(os.environ.get('TG_ID'))
api_hash = os.environ.get('TG_HASH')

# Список чатов (можешь менять их потом сам)
CHANNELS = ['transport_eu', 'transport_pl_de', 'logistyka_transport']

def run_scraper():
    # Создаем временную сессию
    client = TelegramClient('chaos_session', api_id, api_hash)
        all_messages = []
        client.send_code_request('+41793666072')
        for channel in CHANNELS:
            try:
                # Берем последние 20 сообщений из каждого канала
                for message in client.get_messages(channel, limit=20):
                    if message.message:
                        all_messages.append({
                            'text': message.message[:200], # Берем начало сообщения
                            'date': str(message.date),
                            'channel': channel
                        })
            except Exception as e:
                print(f"Ошибка в канале {channel}: {e}")

        # Сохраняем результат в файл для сайта
        with open('data.json', 'w', encoding='utf-8') as f:
            json.dump(all_messages, f, ensure_ascii=False, indent=4)
        print("Охота завершена. Данные обновлены.")

if __name__ == "__main__":
    run_scraper()
