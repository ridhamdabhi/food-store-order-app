FROM node:12.18-alpine
WORKDIR /app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install sails -g
RUN npm install
COPY . /app
EXPOSE 1337
CMD sails lift