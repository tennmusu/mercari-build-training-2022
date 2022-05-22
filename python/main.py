import os
import logging
import pathlib
import shutil
import sqlite3
import hashlib
import re
import uuid
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request

app = FastAPI()
logger = logging.getLogger("uvicorn")
logger.level = logging.INFO
images = pathlib.Path(__file__).parent.resolve() / "image"
origins = [
    os.environ.get("FRONT_URL", "http://localhost:3000"),
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex="https://.*\.ngrok\.io",
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
    max_age=3600,
)
# dict_factoryの定義
def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d


def hash_image_title(imagefile: str) -> str:
    # 画像名を取得
    image_title = imagefile.split(".")[0]
    # uuidを生成
    id = str(uuid.uuid4())
    # 画像名をユニーク化
    image_title = image_title + id
    # 画像名をハッシュ化した後、[.拡張子]部分と結合
    s256 = (
        hashlib.sha256(image_title.encode()).hexdigest() + "." + imagefile.split(".")[1]
    )
    return s256


@app.middleware("http")
async def add_my_headers(request: Request, call_next):
    origin = str(request.headers.get("origin"))
    response = await call_next(request)
    if origin == "http://localhost:3000" or re.match("https://.*\.ngrok\.io", origin):
        response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Vary"] = "Origin"
    return response


@app.get("/")
def root():
    return {"message": "Hello, world!"}


@app.get("/categories")
def get_categories():
    dbname = "../db/mercari.sqlite3"
    conn = sqlite3.connect(dbname)
    conn.row_factory = dict_factory
    c = conn.cursor()
    # カテゴリー一覧を取得
    sql = "select * from categories"
    c.execute(sql)
    categories = c.fetchall()
    c.close()
    conn.close()
    return {"categories": categories}


@app.get("/items")
def get_items():
    dbname = "../db/mercari.sqlite3"
    conn = sqlite3.connect(dbname)
    conn.row_factory = dict_factory
    c = conn.cursor()
    # 全アイテムを取得
    sql = "select items.id,items.name,categories.name as category,items.image from items inner join categories on items.category_id=categories.id"
    c.execute(sql)
    items = c.fetchall()
    c.close()
    conn.close()
    return {"items": items}


@app.get("/items/{item_id}")
def get_detail(item_id: int):
    dbname = "../db/mercari.sqlite3"
    conn = sqlite3.connect(dbname)
    conn.row_factory = dict_factory
    c = conn.cursor()
    # inner join句を利用してアイテムの詳細情報を取得
    sql = f"select items.name,categories.name as category,items.image from items inner join categories on items.category_id=categories.id where items.id={item_id}"
    c.execute(sql)
    result = c.fetchone()
    if result == None:
        raise HTTPException(status_code=404, detail="Item not found")
    conn.commit()
    c.close()
    conn.close()
    return result


@app.post("/items")
def add_item(
    name: str = Form(...), category_id: str = Form(...), image: UploadFile = File(...)
):
    logger.info(f"Receive item: {name}, category_id: {category_id},image {image}")
    # 画像名をハッシュ化
    s256 = hash_image_title(image.filename)
    # サーバー内に保存するpathを生成
    path = images / s256

    with open(path, "w+b") as buffer:
        shutil.copyfileobj(image.file, buffer)
    # ポストされた新アイテムを保存
    # _______________________________________________
    # jsonの場合
    # new_item={"name":  name, "category": category}
    # with open('.\items.json','r') as f:
    #    items = json.load(f)
    #    items['items'].append(new_item)
    # with open('.\items.json','w') as f:
    #    json.dump(items,f,indent=2)
    # _______________________________________________
    # sqlite3の場合
    dbname = "../db/mercari.sqlite3"
    conn = sqlite3.connect(dbname)
    c = conn.cursor()
    # 取得したカテゴリーidとアイテム名、画像をinsertする
    sql = "insert into items(name, category_id,image) values(?,?,?)"
    c.execute(sql, [name, int(category_id), s256])
    conn.commit()
    c.close()
    conn.close()
    return {
        "message": f"item received: {name}, category_id: {category_id}, image: {s256}"
    }


@app.get("/search")
def searchbykeyword(keyword: str):
    dbname = "../db/mercari.sqlite3"
    conn = sqlite3.connect(dbname)
    conn.row_factory = dict_factory
    c = conn.cursor()
    # アイテム名にkeywordを含むアイテムを、正規表現を利用して取得
    sql = f"select items.name,categories.name as category,items.image from items inner join categories on items.category_id=categories.id where items.name glob '*{keyword}*'"
    c.execute(sql)
    result = {"items": c.fetchall()}
    c.close()
    conn.close()
    return result


@app.get("/image/{items_image}")
async def get_image(items_image):
    # Create image path
    image = images / items_image

    if not items_image.endswith(".jpg"):
        raise HTTPException(status_code=400, detail="Image path does not end with .jpg")

    if not image.exists():
        logger.setLevel(logging.DEBUG)
        logger.debug(f"Image not found: {image}")
        image = images / "default.jpg"

    return FileResponse(image)
