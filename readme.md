npm i express fs url formidable path os mime-types request node-html-parser cheerio dddos


#Cac duong dan:

#1. su dung cho ionic default GET/
GET /wwww/*

#2. gui multiple file va params any bang form len test
POST /any-form

#3. gui file bang form len upload
POST /file-upload

#4. gui len serer chuoi json POST
#{command_id:"lenh gi"}
POST /json-data


#5. Mo trang web test upload file don gian xem server hoat dong
GET /test-upload

#6. su dung kiem tra file upload len luu vao 
# temp, screen_shot_image, upload_files
#dowload file from os.temp();
GET /file-upload/<tmp|scr|fix>/<tenfile>

#7. Dowload file mau API bat ky duoi dang text json
#cac mau duoc khai bao truoc bang ten file
GET /api-samples/*<tenfile trong thu muc __dirname + api_samples>

#8. Gia lap lam proxy server get request url from server
GET /url-request/<url can truy van>

#9. Lay thong tin anh dai dien va 
# tom luot cua trang web, bo sung capture screen
GET /url-request-image/<url can truy van>

#10. Dowload danh sach image duoc upload len 
# os.temp()|screenshot|upload;
GET /uploaded-images/<tmp|scr|fix/*>

#11. View list image co trong server 
GET /test-list-images/<tmp|scr|fix/*>

#12 Neu truy cap khong dung dia chi
# server tra ve YOUR ARE STUPID!


