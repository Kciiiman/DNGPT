import requests
import json
import base64
import sys
API_KEY = "mchy0vvsi5JdDOp40CQEvyzS"
SECRET_KEY = "X6GMiGTK3PYpOeqs9h7s6gNsXQtuC6zA"
IS_PY3 = sys.version_info.major == 3
class DemoError(Exception):
    pass
AUDIO_FILE = "model\\upload\\fixed_recording.wav"
def main():
    speech_data = []
    with open(AUDIO_FILE, 'rb') as speech_file:
        speech_data = speech_file.read()

    length = len(speech_data)
    if length == 0:
        raise DemoError('file %s length read 0 bytes' % AUDIO_FILE)
    speech = base64.b64encode(speech_data)
    if (IS_PY3):
        speech = str(speech, 'utf-8')
    url = "https://vop.baidu.com/server_api"
    
    payload = json.dumps({
        "format": "wav",
        "rate": 16000,
        "channel": 1,
        "cuid": "zzTKJiDD59a0eFxdzixqZLXqoZCjkmER",
        "token": get_access_token(),
        "speech": speech,
        "len": length,
    })
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    
    response = requests.request("POST", url, headers=headers, data=payload)
    
    print(response.text)
    

def get_access_token():
    """
    使用 AK，SK 生成鉴权签名（Access Token）
    :return: access_token，或是None(如果错误)
    """
    url = "https://aip.baidubce.com/oauth/2.0/token"
    params = {"grant_type": "client_credentials", "client_id": API_KEY, "client_secret": SECRET_KEY}
    return str(requests.post(url, params=params).json().get("access_token"))

if __name__ == '__main__':
    main()
