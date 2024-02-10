# Bash script to be run on server to update the server
git clone https://github.com/muckrat-git/Capitalism.git
cp Capitalism/server/*.py ./
mv server.py main.py
rm -rf Capitalism