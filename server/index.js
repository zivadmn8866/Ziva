git clone https://github.com/zivadmn8866/Ziva.git
cd Ziva

# move everything out of nested server folder into top-level server
git mv server/server/* server/

# if there are hidden files (like package.json) that didn't move, move them explicitly:
git mv server/server/package.json server/ || true
git mv server/server/.env.local server/ || true

# remove now-empty nested folder
git rm -r server/server

git add -A
git commit -m "Flatten server folder: move nested server/* to server/"
git push origin main   # or your branch
