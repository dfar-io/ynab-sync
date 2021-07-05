# Deletes existing meta file
rm -f meta.txt

# Read commit hash
git rev-parse HEAD >> meta.txt

# Read log message
git log --oneline -1 >> meta.txt

# Read date
date >> meta.txt