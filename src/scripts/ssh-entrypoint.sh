cdi_list=$(nvidia-ctk cdi list);

# if [[ "$cdi_list" =~ "nvidia.com/gpu=all" ]]; then
if [[ -z $cdi_list ]]; then
  sudo nvidia-ctk cdi generate --output=/var/run/cdi/nvidia.yaml;

  sudo systemctl enable --now nvidia-cdi-refresh.path;
  sudo systemctl enable --now nvidia-cdi-refresh.service;

  sudo systemctl restart nvidia-cdi-refresh.service;
else
  echo "GPU pronta!";
fi