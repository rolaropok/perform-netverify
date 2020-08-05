<template>
  <div class="container">
    <div class="row main">
      <div class="col-8 form">
        <div class="img-container row">
          <div class="image-upload col-6">
            <label>Select Front Side Image</label>
            <img :src="frontsideImage" alt="">
            <input @change="handleFrontSideImage" class="custom-input" type="file" accept="image/*">
          </div>
          <div class="image-upload col-6">
            <label>Select Face Image</label>
            <img :src="faceImage" alt="">
            <input @change="handleFaceImage" class="custom-input" type="file" accept="image/*">
          </div>
        </div>
        <div class="select-container row">
          <div class="select form-group col-8">
            <label for="country-select">Select Your Country</label>
            <select class="form-control" name="country-select" v-model="country">
              <option v-for="(cnt, index) of countries" :key="index" :value="cnt['alpha-3']">{{cnt['name']}}</option>
            </select>
          </div>
          <div class="select form-group col-4">
            <label for="select-id-type">Select Your ID Type</label>
            <select class="form-control" name="select-id-type" v-model="idType">
              <option v-for="(type, index) of idTypes" :key="index" :value="type">{{type}}</option>
            </select>
          </div>
        </div>
        <div class="submit">
          <button class="btn btn-secondary" @click="submit">Submit</button>
        </div>
      </div>
      <div class="col-4 response">
        {{response}}
      </div>
    </div>
  </div>
</template>

<script>

import all from './all.json';
import axios from 'axios';

export default {
  name: 'Home',
  data() {
    return {
      frontsideImage: '',
      faceImage: '',
      country: '',
      idType: '',
      idTypes: ['PASSPORT', 'DRIVING_LICENSE', 'ID_CARD', 'VISA'],
      countries: all,
      response: ''
    }
  },
  methods: {
    handleFrontSideImage(e) {
      const selectedImage = e.target.files[0];
      this.createBase64Image(selectedImage, 'front');
    },
    handleFaceImage(e) {
      const selectedImage = e.target.files[0];
      this.createBase64Image(selectedImage, 'face');
    },
    createBase64Image(fileObject, type) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (type === 'front') {
          this.frontsideImage = e.target.result;
        } else {
          this.faceImage = e.target.result;
        }
      };
      reader.readAsDataURL(fileObject);
    },
    submit() {
      this.response = '';
      console.log('submit data', this.frontsideImage, this.faceImage, this.country, this.idType);
      axios.post('http://127.0.0.1:3000/upload', {
        frontsideImage: this.frontsideImage,
        faceImage: this.faceImage,
        country: this.country,
        idType: this.idType
      }).then(response => {
        this.response = response;
      }).catch(err => {
        this.response = err.response.data;
      });
    }
  }
}
</script>

<style lang="scss">

.main {
  padding-top: 5rem;
  padding-bottom: 5rem;
  .form {
    .img-container {
      .image-upload {
        position: relative;
        img {
          width: 100%;
        }
      }
    }

    .select-container {
      margin-top: 2rem;
      .select {
        select {
          width: 100%;
        }
      }
    }

    .submit {
      margin-top: 2rem;
      display: flex;
      justify-content: center;

      button {
        width: 30%;
      }
    }
  }
}

</style>