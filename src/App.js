import React, { Component } from "react";
import { uniqueId } from "lodash";
import filesize from "filesize";

import api from "./services/api";

import GlobalStyle from "./styles/global";
import { Container, Content } from "./styles";

import Upload from "./components/Upload";
import FileList from "./components/FileList";

import {ToastsContainer, ToastsContainerPosition, ToastsStore} from 'react-toasts';

class App extends Component {
  state = {
    uploadedFiles: [],
    fileLimit: 0,
    firstInsert: 0
  };

  async componentDidMount() {
    const response = await api.get("posts");

    this.setState({
      uploadedFiles: response.data.map(file => ({
        id: file._id,
        name: file.name,
        readableSize: filesize(file.size),
        preview: file.url,
        uploaded: true,
        url: file.url
      })),
    });

    this.setState({
      fileLimit: this.state.uploadedFiles.length
    });
  }

  handleUpload = files => {
    this.setState({
      fileLimit: this.state.fileLimit + files.length
    })

    if(this.state.firstInsert !== 0 && this.state.fileLimit === 11){
      ToastsStore.info("Desculpe só é permitido somente até 11 imagens!")
      return;
    }

    if(this.state.firstInsert === 0 && this.state.fileLimit > 11){
      ToastsStore.info("Desculpe só é permitido somente até 11 imagens!")
      files.splice(11, files.length);
      if(files.length < 11){
        files = [];
        return;
      }

      this.setState({
        firstInsert: this.state.firstInsert + 1,
        fileLimit: 11
      })
    }
    
    const uploadedFiles = files.map(file => ({
      file,
      id: uniqueId(),
      name: file.name,
      readableSize: filesize(file.size),
      preview: URL.createObjectURL(file),
      progress: 0,
      uploaded: false,
      error: false,
      url: null
    }));

    this.setState({
      uploadedFiles: this.state.uploadedFiles.concat(uploadedFiles)
    });

    uploadedFiles.forEach(this.processUpload);
  };

  updateFile = (id, data) => {
    this.setState({
      uploadedFiles: this.state.uploadedFiles.map(uploadedFile => {
        return id === uploadedFile.id
          ? { ...uploadedFile, ...data }
          : uploadedFile;
      })
    });
  };

  processUpload = uploadedFile => {
    const data = new FormData();

    data.append("file", uploadedFile.file, uploadedFile.name);

    api
      .post("posts", data, {
        onUploadProgress: e => {
          const progress = parseInt(Math.round((e.loaded * 100) / e.total));

          this.updateFile(uploadedFile.id, {
            progress
          });
        }
      })
      .then(response => {
        this.updateFile(uploadedFile.id, {
          uploaded: true,
          id: response.data._id,
          url: response.data.url
        });
      })
      .catch(() => {
        this.updateFile(uploadedFile.id, {
          error: true
        });
      });
  };

  handleDelete = async id => {
    await api.delete(`posts/${id}`);

    this.setState({
      uploadedFiles: this.state.uploadedFiles.filter(file => file.id !== id),
      fileLimit: this.state.fileLimit - 1
    });
  };

  componentWillUnmount() {
    this.state.uploadedFiles.forEach(file => URL.revokeObjectURL(file.preview));
  }

  render() {
    const { uploadedFiles } = this.state;

    return (
      <Container>
        <Content>
          <Upload onUpload={this.handleUpload} />
          {!!uploadedFiles.length && (
            <FileList files={uploadedFiles} onDelete={this.handleDelete} />
          )}
        </Content>
        <ToastsContainer position={ToastsContainerPosition.TOP_RIGHT} store={ToastsStore}/>
        <GlobalStyle />
      </Container>
    );
  }
}

export default App;