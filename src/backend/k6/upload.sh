#!/bin/bash

find ./inputs -maxdepth 1 -type f -name "*.cif" -print0 | while IFS= read -r -d $'\0' file; do
    filename=$(basename "$file")

    echo "Uploading '$filename':"

    response=$(curl -X 'POST' \
        'http://localhost:8000/api/v1/files/upload' \
        -H 'accept: application/json' \
        -H 'Content-Type: multipart/form-data' \
        -F "files=@$file")

    if [[ $? -ne 0 ]]; then
        echo "Warning: curl command failed for '$filename' (exit code $?)"
    else
        echo "--- Finished '$filename' (see curl output above for server response) ---"
    fi

    file_hash=$(echo "$response" | jq -r '.data[0].fileHash' 2>/dev/null)

    echo $file_hash
    echo $file_hash >>./hashes

    sleep 0.2
done
