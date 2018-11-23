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


#Tao key cho https co 3 buoc dung lenh openssl
1. Tao key file voi:
openssl genrsa -out <private key filename> <length of key>

ex:
openssl genrsa -out ./cert/my-private-public-key.pem 4096

--> file sinh ra la khoa rieng cua he thong su dung de ma hoa
--> trong khoa rieng nay chua: private_key + public_key theo RSA

2. Tao mot request certificate chua thong tin ca nhan cua he thong
openssl req -new -key <private key filename> -out <certificate request filename>

ex:
openssl req -new -key ./cert/privatekey.pem -out ./cert/my-com-req-cert.csr

--> sinh ra mot file yeu cau xac nhan to chuc, thiet bi, theo key
--> thong tin cua file chua thong tin cua to chuc + public key 
--> ma hoa boi private key chi giai ma bang public key kem theo trong file nay

3. Sau khi co file request certificate se gui den trung tam xac nhan trung gian de ho tao cho ta file xac nhan. Chứa thông tin của public_key của ta, public key của đơn vị xác nhận uy tín, thông tin của đơn vị đã khai ở bước 2.
Do tự xác nhận trên máy nên ta dùng luôn công cụ để tạo ra file certificate. Lệnh
To generate a temporary certificate which is good for 365 days, issue the following command:
To generate a temporary certificate which is good for 365 days, issue the following command:
openssl x509 -req -days <so luong ngay> -in <file yeu cau buoc 2> -signkey <file private key cua to chuc xac nhan hoac self buoc 1> -out <ten file certificate da gan ma chung thuc>
ex:
openssl x509 -req -days 365 -in ./cert/my-com-req-cert.csr -signkey ./cert/my-private-public-key.pem -out ./cert/my-certificate.pem


#Mau tao:
openssl genrsa -out ./cert/my-private-public-key.pem 4096
openssl req -new -key ./cert/privatekey.pem -out ./cert/my-com-req-cert.csr
openssl x509 -req -days 365 -in ./cert/my-com-req-cert.csr -signkey ./cert/my-private-public-key.pem -out ./cert/my-certificate.pem
