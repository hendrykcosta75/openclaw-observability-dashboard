#!/usr/bin/env bash
set -euo pipefail

# Rollback the systemd collector timer without touching the dashboard app or the
# OpenClaw gateway. Run as the ubuntu user on the Lightsail VPS.

SERVICE=openclaw-observability-collector.service
TIMER=openclaw-observability-collector.timer
DATA_DIR=/home/ubuntu/openclaw-observability-dashboard/data

systemctl --user stop "${TIMER}" || true
systemctl --user stop "${SERVICE}" || true
systemctl --user disable --now "${TIMER}" || true

rm -f \
  "${HOME}/.config/systemd/user/${SERVICE}" \
  "${HOME}/.config/systemd/user/${TIMER}"

systemctl --user daemon-reload

# Keep data files so the dashboard can still show the last snapshot. If you want
# a clean reset, delete them manually.
if [ "${1:-}" = "--purge" ]; then
  rm -f "${DATA_DIR}/openclaw-snapshot.json" "${DATA_DIR}/openclaw-token-ledger.json"
  echo "Collector stopped and snapshot data purged."
else
  echo "Collector stopped. Snapshot data kept at ${DATA_DIR}."
fi
