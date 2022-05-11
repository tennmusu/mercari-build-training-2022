package main

import (
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"fmt"
	"net/http"
	"os"
	"path"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/labstack/gommon/log"
	_ "github.com/mattn/go-sqlite3"
)

const (
	ImgDir = "image"
)

type Response struct {
	Message string `json:"message"`
}
type item struct {
	Category string `json:"category"`
	Name     string `json:"name"`
	Image    string `json:"image"`
}
type item_schema struct {
	Id          int    `json:"id"`
	Category_Id int    `json:"category_id"`
	Name        string `json:"name"`
	Image       string `json:"image"`
}

type itemlist struct {
	Items []item_schema `json:"items"`
}

func getSHA256Binary(s string) []byte {
	r := sha256.Sum256([]byte(s))
	return r[:]
}

func root(c echo.Context) error {
	res := Response{Message: "Hello, world!"}
	return c.JSON(http.StatusOK, res)
}

func getItems(c echo.Context) error {
	db, err := sql.Open("sqlite3", "../db/mercari.sqlite3")
	if err != nil {
		c.Logger().Error("error occured while opening database:%s", err)
	}
	rows, err := db.Query("select * from items")
	var result itemlist
	defer rows.Close()
	for rows.Next() {
		var id int
		var category_id int
		var name string
		var image string
		rows.Scan(&id, &category_id, &name, &image)
		r_json := item_schema{Id: id, Category_Id: category_id, Name: name, Image: image}
		result.Items = append(result.Items, r_json)
	}
	return c.JSON(http.StatusOK, result.Items)
}

func get_detail(c echo.Context) error {
	db, err := sql.Open("sqlite3", "../db/mercari.sqlite3")
	if err != nil {
		c.Logger().Error("error occured while opening database:%s", err)
	}
	items_id := c.Param("item_id")
	//inner join句を利用してアイテムの詳細情報を取得
	row := db.QueryRow("select items.name,categories.name,items.image from items inner join categories on items.category_id=categories.id where items.id=?", items_id)
	var category string
	var name string
	var image string
	row.Scan(&name, &category, &image)
	result := item{category, name, image}

	return c.JSON(http.StatusOK, result)
}
func addItem(c echo.Context) error {
	// Get form data
	name := c.FormValue("name")
	category := c.FormValue("category")
	image := c.FormValue("image")
	//画像名をハッシュ化した後、[.拡張子]部分と結合
	image_title := strings.Split(image, ".")[0]
	s256 := hex.EncodeToString(getSHA256Binary(image_title)) + "." + strings.Split(image, ".")[1]
	//new_item := item{Name: name, Category: category, Image: image}
	/*jsonの場合
	jsonFromFile, err := ioutil.ReadFile("./items.json")
	if err != nil {
		c.Logger().Error("Notfound ./items.json")
	}
	var items itemlist
	err = json.Unmarshal(jsonFromFile, &items)
	if err != nil {
		c.Logger().Error("error occured while unmarshalling json")

	}
	items.Items = append(items.Items, new_item)
	file, _ := json.MarshalIndent(items, "", " ")
	ioutil.WriteFile("./items.json", file, 0644)
	*/
	db, err := sql.Open("sqlite3", "../db/mercari.sqlite3")
	if err != nil {
		c.Logger().Error("error occured while opening database:%s", err)
	}

	//カテゴリー名からカテゴリーidを取得
	row := db.QueryRow("select id from categories where name=?", category)
	var category_id int
	row.Scan(&category_id)
	c.Logger().Infof("category_id:%d", category_id)
	//取得したカテゴリーidとアイテム名、画像をinsertする
	Q, err := db.Prepare("insert into items(name, category_id,image) values(?,?,?)")
	_, err = Q.Exec(name, category_id, s256)
	c.Logger().Infof("Receive item: %s, category: %s, image", name, category, image)

	message := fmt.Sprintf("item received: %s, category: %s,image %s", name, category, image)
	res := Response{Message: message}

	return c.JSON(http.StatusOK, res)
}

func searchbykeyword(c echo.Context) error {
	keyword := c.QueryParam("keyword")
	db, err := sql.Open("sqlite3", "../db/mercari.sqlite3")
	if err != nil {
		c.Logger().Error("error occured while opening database:%s", err)
	}
	//アイテム名にkeywordを含むアイテムを、正規表現を利用して取得
	Q := fmt.Sprintf("select * from items where name glob '*%s*'", keyword)
	rows, err := db.Query(Q)
	defer rows.Close()
	var result itemlist
	for rows.Next() {
		var id int
		var category_id int
		var name string
		var image string
		rows.Scan(&id, &category_id, &name, &image)
		r_json := item_schema{Id: id, Category_Id: category_id, Name: name, Image: image}
		result.Items = append(result.Items, r_json)
	}
	return c.JSON(http.StatusOK, result)
}
func getImg(c echo.Context) error {
	// Create image path
	imgPath := path.Join(ImgDir, c.Param("itemImg"))

	if !strings.HasSuffix(imgPath, ".jpg") {
		res := Response{Message: "Image path does not end with .jpg"}
		return c.JSON(http.StatusBadRequest, res)
	}
	if _, err := os.Stat(imgPath); err != nil {
		c.Logger().SetLevel(log.DEBUG)
		c.Logger().Debugf("Image not found: %s", imgPath)
		imgPath = path.Join(ImgDir, "default.jpg")
	}
	return c.File(imgPath)
}

func main() {
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Logger.SetLevel(log.INFO)

	front_url := os.Getenv("FRONT_URL")
	if front_url == "" {
		front_url = "http://localhost:3000"
	}
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{front_url},
		AllowMethods: []string{http.MethodGet, http.MethodPut, http.MethodPost, http.MethodDelete},
	}))

	// Routes
	e.GET("/", root)
	e.GET("/items", getItems)
	e.GET("/items/:item_id", get_detail)
	e.GET("/search", searchbykeyword)
	e.POST("/items", addItem)
	e.GET("/image/:itemImg", getImg)

	// Start server
	e.Logger.Fatal(e.Start("localhost:9000"))
}
