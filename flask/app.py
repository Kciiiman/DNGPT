from flask import Flask, render_template, request,jsonify
from model.llama.Extract_Fre import api_extract
from model.tts.TextToSpeech import TextToSpeech
from model.stt.SpeechToText import SpeechToText
import click
import os
import sys
from flask_sqlalchemy import SQLAlchemy

click.disable_unicode_output = True

app = Flask(__name__)

WIN = sys.platform.startswith('win')
if WIN:  # 如果是 Windows 系统，使用三个斜线
    prefix = 'sqlite:///'
else:  # 否则使用四个斜线
    prefix = 'sqlite:////'
app.config['SQLALCHEMY_DATABASE_URI'] = prefix + os.path.join(app.root_path, 'data.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # 关闭对模型修改的监控
app.config["SECRET_KEY"] = "kkk"

db = SQLAlchemy()
db.init_app(app)

#用户表
class User(db.Model):  
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)  #用户编号
    name = db.Column(db.String(20))  # 名字
    question = db.Column(db.String(60))  # 问题
    answer = db.Column(db.String(30))  # 问题回答

# 设置允许上传的文件类型
ALLOWED_EXTENSIONS = {'wav'}
# 设置固定的文件保存路径和文件名
UPLOAD_FOLDER = 'model/stt/uploads'
FIXED_FILENAME = 'fixed_recording.wav'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
FULL_PATH = ''

global_Question = ''

# 文本关键字提取
@app.route("/extraction", methods=["POST"])
def keyword_extraction():
    #question = "一般来说是看我的心情，通常我每天都是要喝水的。"
    #question = request.form["question"]
    # 接收文本
    data = request.get_json()
    if not data:
        return jsonify({"error": "请求正文中缺少 question"}), 400
    question = data.get("question")
    if not question:
        return jsonify({"error": "请求正文中缺少 question 键"}), 400
    
    output = api_extract(question)
    
    dataSave(answer=output)
    # 返回提取到的关键词
    return jsonify({'extract': output})

#文本转语音
@app.route("/tts", methods=["POST"])
def tts():
    # 接收 JSON 数据
    data = request.get_json()

    if not data:
        return jsonify({"error": "请求正文中缺少 text"}), 400
    text = data.get("text")
    if not text:
        return jsonify({"error": "请求正文中缺少 text 键"}), 400
    global global_Question
    global_Question = text
    path = 'C:\\Users\\1\\Documents\\HBuilderProjects\\Diet_Nutrition_GPT\\uni_ym\\static\\tts_voice\\output.wav'
    # 将文本转换为语音
    TextToSpeech(text,path)
    
    return jsonify({"success": True, "path": path})



def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/voice', methods=['POST'])
def voice_save():
    # 检查是否有文件上传
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})
    
    file = request.files['file']

    # 检查文件名和文件类型
    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type'})

    # 确保目录存在
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    filename = FIXED_FILENAME
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    global FULL_PATH
    FULL_PATH = filepath
    return jsonify({'success': 'File uploaded successfully', 'filepath': filepath})

#语音转文本
@app.route("/stt", methods=["GET"])
def stt():
    # 接收音频地址数据
    # data = request.get_json()
    # print(data)
    # if not data:
    #     return jsonify({"error": "请求正文中缺少 path"}), 400
    # path = data.get("path")
    # if not data:
    #     return jsonify({"error": "请求正文中缺少 path 键"}), 400
    
    # 将音频数据转换为文本
    text = SpeechToText(FULL_PATH)
    print(text)
    # 返回识别结果
    return jsonify({"text": text})


#数据库存储
def dataSave(answer):       #对名字和问题的调整
    # user = User(name="李辉", question = global_Question, answer = answer)
    # db.session.add(user)
    # db.session.commit()

    with app.app_context():
        try:
            new_user = User(name='李辉', question=global_Question, answer=answer)
            db.session.add(new_user)
            db.session.commit()  # 提交事务
        except Exception as e:
            db.session.rollback()  # 如果发生错误，回滚事务
            print(e)

# 主页s
@app.route("/")
def index():
    return render_template("index.html")


# 运行应用程序
if __name__=='__main__':
     app.run(debug=True)