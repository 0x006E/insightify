import hashlib
import json
import os
import zipfile

from wheel import wheelfile


def generate_package_info(file_path, install_dir):
    package_info = {}
    print(calculate_sha256(file_path))


def calculate_sha256(file_path):
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            sha256_hash.update(chunk)
    return sha256_hash.hexdigest()


wheel_file_path = "public\wheels\sqlite3-1.0.0.zip"
install_directory = "site"

package_info = generate_package_info(wheel_file_path, install_directory)

json_string = json.dumps(package_info, indent=4)
print(json_string)
