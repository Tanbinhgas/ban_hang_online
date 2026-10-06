pipeline {
    agent any

    environment {
        IMAGE_NAME = 'gearhub-web'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        CONTAINER_NAME = 'gearhub-web'
        HOST_PORT = '8090'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    if (isUnix()) {
                        sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest ."
                    } else {
                        bat "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest ."
                    }
                }
            }
        }

        stage('Deploy Container') {
            steps {
                script {
                    if (isUnix()) {
                        sh """
                            docker stop ${CONTAINER_NAME} || true
                            docker rm ${CONTAINER_NAME} || true
                            docker run -d -p ${HOST_PORT}:80 --name ${CONTAINER_NAME} ${IMAGE_NAME}:latest
                        """
                    } else {
                        bat """
                            docker stop ${CONTAINER_NAME}
                            docker rm ${CONTAINER_NAME}
                            docker run -d -p ${HOST_PORT}:80 --name ${CONTAINER_NAME} ${IMAGE_NAME}:latest
                        """
                    }
                }
            }
        }

        stage('Verify') {
            steps {
                script {
                    if (isUnix()) {
                        sh "docker ps --filter name=${CONTAINER_NAME}"
                    } else {
                        bat "docker ps --filter name=${CONTAINER_NAME}"
                    }
                }
            }
        }
    }

    post {
        success {
            echo "Deploy thanh cong! Truy cap tai http://localhost:${HOST_PORT}"
        }
        failure {
            echo "Build hoac deploy that bai, kiem tra log phia tren."
        }
    }
}
