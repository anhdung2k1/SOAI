# Makefile

RELEASE := $(RELEASE)
USERNAME := $(USER)
TOP_DIR := $(CURDIR)
version := $(shell $(TOP_DIR)/vas.sh get_version)
DOCKER_CONFIG_DIR ?= build/docker

# Clean the repository
clean:
	@echo "Clean Repository"
	./vas.sh clean

# Step 1: Login into private docker registry
# Step 2: Run this job to copy docker config to build/docker/config.json
# Step 3: Create docker secret harbordocker
#	kubectl -n <namespace> create secret generic harbordocker \
	--from-file=.dockerconfigjson=build/docker/config.json \
	--type=kubernetes.io/dockerconfigjson
prepare:
	mkdir -p $(DOCKER_CONFIG_DIR)
	cp -rf ~/.docker/config.json $(DOCKER_CONFIG_DIR)/config.json

# Init the repository
init:
	@echo "Create build dataset and model directory"
	$(TOP_DIR)/vas.sh dir_est
	@echo "mkdir variables folder"
	mkdir -p build/var
	@if [ "$(RELEASE)" = "true" ]; then \
		echo "Generate release version"; \
		$(TOP_DIR)/vas.sh get_version > build/var/.release_version; \
	else \
		echo "Get version prefix"; \
		$(TOP_DIR)/vas.sh get_version > build/var/.version; \
	fi

## Package the helm chart
package-helm:
	@echo "Package helm"
	$(TOP_DIR)/vas.sh build_helm \
		--release=$(RELEASE)
		--user=$(USERNAME)

image: 	image-chatbot \
		image-consul \
		image-document \
		image-flowise \
		image-knowledge_base \
		image-ollama \
		image-qdrant \
		image-webserver \
		image-web

image-chatbot:
	@echo "build chatbot Image"
	$(TOP_DIR)/vas.sh build_image --name=chatbot
image-consul:
	@echo "build consul Image"
	$(TOP_DIR)/vas.sh build_image --name=consul
image-document:
	@echo "build document Image"
	$(TOP_DIR)/vas.sh build_image --name=document
image-flowise:
	@echo "build flowise Image"
	$(TOP_DIR)/vas.sh build_image --name=flowise
image-knowledge_base:
	@echo "build knowledge_base Image"
	$(TOP_DIR)/vas.sh build_image --name=knowledge_base
image-ollama:
	@echo "build ollama Image"
	$(TOP_DIR)/vas.sh build_image --name=ollama
image-qdrant:
	@echo "build qdrant Image"
	$(TOP_DIR)/vas.sh build_image --name=qdrant
image-webserver:
	@echo "build webserver Image"
	$(TOP_DIR)/vas.sh build_image --name=webserver
image-web:
	@echo "build web frontend Image"
	$(TOP_DIR)/vas.sh build_image --name=web

push: 	push-chatbot \
		push-consul \
		push-document \
		push-flowise \
		push-knowledge_base \
		push-ollama \
		push-qdrant \
		push-webserver \
		push-web

push-chatbot:
	@echo "push image-chatbot"
	$(TOP_DIR)/vas.sh push_image --name=chatbot
push-consul:
	@echo "push image-consul"
	$(TOP_DIR)/vas.sh push_image --name=consul
push-document:
	@echo "push image-document"
	$(TOP_DIR)/vas.sh push_image --name=document
push-flowise:
	@echo "push image-flowise"
	$(TOP_DIR)/vas.sh push_image --name=flowise
push-knowledge_base:
	@echo "push image-knowledge_base"
	$(TOP_DIR)/vas.sh push_image --name=knowledge_base
push-ollama:
	@echo "push image-ollama"
	$(TOP_DIR)/vas.sh push_image --name=ollama
push-qdrant:
	@echo "push image-qdrant"
	$(TOP_DIR)/vas.sh push_image --name=qdrant
push-webserver:
	@echo "push image-webserver"
	$(TOP_DIR)/vas.sh push_image --name=webserver
push-web:
	@echo "push image-web"
	$(TOP_DIR)/vas.sh push_image --name=web
push-helm:
	@echo "push helm chart"
	$(TOP_DIR)/vas.sh push_helm

generate-ca:
	@echo "Generate CA files"
	./vas.sh generate_ca