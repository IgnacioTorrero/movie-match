cd auth-service/front-end
npm run build
Copy-Item -Recurse -Force dist\* ..\..\api-gateway\public\auth

cd ..\..\movie-service\front-end
npm run build
Copy-Item -Recurse -Force dist\* ..\..\api-gateway\public\movies
