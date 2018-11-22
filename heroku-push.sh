
#ionic build --prod 
#su dung cordova, build browser de tao www
ionic cordova build browser --prod --release

git add .
git commit -am 'HEROKU Deployment by cuongdq'
#git remote rm heroku
#heroku git:remote -a cuongdq-ionic
git push heroku master
heroku open