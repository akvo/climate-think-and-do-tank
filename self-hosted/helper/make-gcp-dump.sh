#!/usr/bin/env bash

set -eu

if [[ "$#" -ne 5 ]]; then
    echo "Usage: ${BASH_SOURCE[0]} <gcloud_project> <sql_instance> <db_name> <bucket_name> <output_dir>"
    exit 1
fi

gcloud_project="${1}"
sql_instance="${2}"
db_name="${3}"
bucket_name="${4}"
output_dir="${5}"

filename="db_dump.$(date +%s)"
dump_file="${filename}.gz"

if [[ -z "$(gcloud config list --format='value(core.account)')" ]]; then
  gcloud auth login
fi
gcloud config set project "${gcloud_project}"
gcloud sql export sql "${sql_instance}" "gs://${bucket_name}/${dump_file}" --database="${db_name}"
gsutil cp "gs://${bucket_name}/${dump_file}" "${output_dir}/${dump_file}"
gsutil rm "gs://${bucket_name}/${dump_file}"

cd "${output_dir}"
ln -nfs "${dump_file}" db_dump.gz
