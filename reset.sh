echo "Running: npm cache clean --force"
npm cache clean --force
echo "Running: rm -rf node_modules package-lock.json ~/.npm"
rm -rf node_modules package-lock.json ~/.npm