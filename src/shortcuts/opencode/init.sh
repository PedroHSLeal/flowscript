apt update -y
apt install -y curl
apt install -y git

install -dm 755 /etc/apt/keyrings

curl -fSs https://mise.jdx.dev/gpg-key.pub | tee /etc/apt/keyrings/mise-archive-keyring.asc 1> /dev/null

echo "deb [signed-by=/etc/apt/keyrings/mise-archive-keyring.asc] https://mise.jdx.dev/deb stable main" | tee /etc/apt/sources.list.d/mise.list

apt update -y

apt install -y mise

curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh | bash
echo >> /root/.bashrc
echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv bash)"' >> /root/.bashrc
eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv bash)"

curl -fsSL https://opencode.ai/install | bash

brew install asdf