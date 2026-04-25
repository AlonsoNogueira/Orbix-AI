#Version of project image
FROM node:22-alpine

#workbook inside the container.
WORKDIR /app

#Copies files from the host machine into the image.
COPY package.json .

#Executes commands during image construction.
RUN npm install

#Copies files from the host machine into the image.
COPY . .

#Execute commands to build the project.
RUN npm run build

#It documents the door used.
EXPOSE 3000

#Default command when starting the container.
CMD ["npm", "start"]