# First, check if git is on the machine... if not, just use
# the metadata file passed in.
sha=`git rev-parse HEAD`
if [ $? -ne 0 ]; then
    echo 'Git not found, using existing metadata file.'
    exit 0
fi

# Deletes existing meta file
rm -f meta.txt

# Read commit hash
echo $sha >> meta.txt

# Read log message
git log --oneline -1 >> meta.txt

# Read date
date >> meta.txt
