import hashlib
import json
import os
import zipfile

from wheel import wheelfile


def generate_package_info(file_path, install_dir):
    package_info = {}
    with wheelfile.WheelFile(file_path) as wheel:
        package_info['name'] = wheel.parsed_filename.group('name')
        package_info['version'] = wheel.parsed_filename.group('ver')
        package_info['file_name'] = os.path.basename(file_path)
        package_info['install_dir'] = install_dir
        package_info['sha256'] = calculate_sha256(file_path)
        package_info['package_type'] = "package"
        package_info['imports'] = [package_info['name']]
        package_info['depends'] = []

    return {package_info['name']: package_info}


def calculate_sha256(file_path):
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            sha256_hash.update(chunk)
    return sha256_hash.hexdigest()


wheel_file_path = "public/wheels/pdf_parser-1.0.0-py3-none-any.whl"
install_directory = "site"

package_info = generate_package_info(wheel_file_path, install_directory)

json_string = json.dumps(package_info, indent=4)
print(json_string)
