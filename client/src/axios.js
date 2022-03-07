import axios from 'axios'

const instance = axios.create({
    baseURL: 'https://whatsapp-clone-mern4.herokuapp.com/messages/',
})

export default instance