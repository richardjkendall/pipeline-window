FROM python:3.8-alpine

# make base folder
RUN mkdir /app

# install deps
ADD requirements.txt /app
RUN pip install -r /app/requirements.txt

# add code
ADD *.py /app/

# add the GUI files needed
ADD frontend/build /app/static

# run gunicorn
WORKDIR /app
CMD [ "gunicorn", "--bind", "0.0.0.0:5000", "--forwarded-allow-ips=\"*\"", "-w", "4", "app:app" ]