#!/usr/bin/env bash
set -euo pipefail

# Install or refresh the systemd user timer for the OpenClaw observability
# collector. Run as the ubuntu user on the Lightsail VPS.

SERVICE=openclaw-observability-collector.service
TIMER=openclaw-observability-collector.timer
SOURCE_DIR=/home/ubuntu/openclaw-observability-dashboard
DATA_DIR="${SOURCE_DIR}/data"
SYSTEMD_USER_DIR="${HOME}/.config/systemd/user"

mkdir -p "${DATA_DIR}" "${SYSTEMD_USER_DIR}"
chmod 750 "${DATA_DIR}"

cp "${SOURCE_DIR}/deploy/systemd/${SERVICE}" "${SYSTEMD_USER_DIR}/"
cp "${SOURCE_DIR}/deploy/systemd/${TIMER}" "${SYSTEMD_USER_DIR}/"

systemctl --user daemon-reload
systemctl --user enable --now "${TIMER}"
systemctl --user start "${SERVICE}"

sleep 2
systemctl --user status --no-pager "${TIMER}"
systemctl --user status --no-pager "${SERVICE}"

if [ -f "${DATA_DIR}/openclaw-snapshot.json" ]; then
  echo "Snapshot updated: $(stat -c '%y' '${DATA_DIR}/openclaw-snapshot.json')"
else
  echo "WARNING: snapshot file not yet present; it will be written on the next timer fire" >&2
fi
