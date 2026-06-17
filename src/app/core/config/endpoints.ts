
export const ENDPOINTS = {

  auth: '/api/Auth', //AQUÍ DENTRO ESTÁN REGISTER, LOGIN Y LOGOUT POR LO QUE EN EL SERVICE.ts ES this.http.post(`${this.apiUrl}/register`,usuario)

  historial: '/api/Fact_Historico_Actividad',

  gestos: '/api/gestos',

  dispositivos: '/api/aparatos',

  control: '/api/aparatos/control',

  cuenta: '/api/cuenta'

};