// Albo degli eroi: una pagina web pubblica (/plugins/albo/) con la scheda di ogni eroe, e /albo <nome> in gioco.
// Il plugin conta da solo livello, primo e ultimo accesso e ore di gioco (eventi join/leave, più un controllo ogni
// minuto così un riavvio fa perdere al massimo un minuto). Arena dalla classifica del server; il resto lo legge, in sola
// lettura, dai dati degli altri plugin dentro voxelia-data.json, quando ci sono: Gara di pesca, Torneo dell'arena,
// Caccia al tesoro, Premio giornaliero e Case (casa e pet). Non scrive mai i dati degli altri plugin.
// Privacy: non legge Guardiano, Posta e amici, Teletrasporto e Taglie; non mostra stanze, codici, IP, depositi né
// statistiche dei pet. Ogni eroe può togliersi dalla pagina pubblica con /albo nascondi (e tornare con /albo mostra);
// l'admin può nascondere dei nomi con "nascosti" nel config.
// Se un altro plugin cambia il modo in cui salva i dati, va aggiornata qui solo la funzione extra().
const fs = require('fs'), path = require('path');

// nomi da mostrare per i modelli di casa e le specie dei pet (dal plugin Case)
const MODELLI = { casetta: 'Casetta di legno', cottage: 'Cottage di pietra', villetta: 'Villetta con giardino', baita: 'Baita di montagna', torre: 'Torre del mago',
  pescatore: 'Casa del pescatore', villa: 'Villa nobiliare', tenda: 'Tenda del deserto', igloo: 'Igloo dei Picchi', fattoria: 'Casale di campagna' };
const SPECIE = { cane: 'Cane', gatto: 'Gatto', coniglio: 'Coniglio', volpe: 'Volpe', pinguino: 'Pinguino', gufo: 'Gufo', tartaruga: 'Tartaruga',
  draghetto: 'Draghetto', maialino: 'Maialino', pulcino: 'Pulcino' };
// icone voxel del gioco (Voxelia 7.11, le stesse del menu e della guida) per la pagina web
const ICONE = {scroll: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAB1klEQVR4AexZsUoDQRAdDyuxEfwAS/9A8Ass7AVrsbIWO7ELFlZiIdaKvYgfIEKa1FZir2AjVoLOQmZ5u7lN7ti922x2Qx47d7m9mTfvcYG5ihyf9dXlv3mCo0xyEnBtmLfzi0UALfMxuqDYeLg5IgHWhi5YLAWQWSpxhdKgZYajN4oNbKJYSa1Yc7EQdilGbCiAlnlmCwn6LExy2uvuwSUJPr9/9wUGgT4LDZUrfQIsxZJAJFLr4OqRBFt7pyTY3N6h0Hj/WSOB5LRXrlHbBtVLXwFkk2JsKMAyaTs1IXM9OKcQcOXiemptw9ffCQwCfDK5byHQo2TaNpizKIDdiBG3UGCyvMOTYwqByTs3P+NFoHma7q7Mj0CIPy77Hj765KeAT7e62NtagRBPHfsePsRaE/BJ1sXevAnYT5NZx0WBmg7kbSH7aTLruKaBU0/xCPEWoF+44Ka8FcBOxIoNBVguLZMxqb4/o+EYry9PFBobK18kwLwYq6m0AOs0CMTqok/e9AmgHCKRWnFS7dOhtnsxL8Y4rcZ7pq8Askkxrnh8p8eJaiotQDIoX6MYXo6Euh6n1VyzHjkWC6FSMWJDAZam1k4oX6yYa9O2wUYZBPCHVOLkCfwDAAD//zwYj+YAAAAGSURBVAMAvBVAkPtdJ5YAAAAASUVORK5CYII=',
  swords: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAACsElEQVR4AeyZMYtTQRSFr8HSMo2Ngs2WljYiKAjaamdrY6k/wD/g/1ArawtBQSy0FESwERTEYtMpNgruPWS/4czyhrxlN5tMNuGdnLtvJjP3zjm8mU0mYa/pubP/h2BdTjQcykX3PImqAG/oJe6/AEkCdn/9DfDu4/cAtIuXrYzmAOQiJhcx7eL+FVj2ii57/EqBL19/BvCJJRuQbMD7HCVmPLHsAshF/Ob1qwA+V1WAN/QS91/A7Pe/M+Dq5QsBovHCSmJJDhrdm7f5nBjLiGUXgGXEjx/dD5D53gP9K9Bcok4aKgVSlqXaSXYBsgvAMmLZBWAZceZWbONrWxXgDb3Em1tASnYsdsIyYiwjll0AlhHLLiBzGLRNuuM52FwFssIurlEKpJSHspMsMgQsI5ZdAJYR51wLbeMrO6oA/8C6xaepgPnap8SDdtq5dD6ALDIELCOWXUCOeSjbzDOZv58+BeZ1r897pYA2G7DCFMsm5TmQl9jvVwV4Qy9x/wVIEvDtxbUA3BO7Gvob+GblTx09ZYZw/cbNAPqPDuR4z0BrLvISZ9/yFWj/CnjFPcYTSQK8AO6JXbIxtmGDOsg+vsdYSVzN9eNO7O7D+ysnsLWQr8wq4snFu28DtBJARnHraeN28bONx3znJB4z15/3swAvP8wCkK94a6HWSp7U/UlKXI7HkgR4Asgo/vT0VoCWbfyzGZezjc8lG4Gd6cMAmgNgGfGDJ58D5Djl+L21UK7wSq9KgZRmoZ1uX5kGYDMR5wbk55liG68u+5QzjJ5oAMuIZReAZcSZW7GNj1kV4A29xJtbQEq20E6ukmwEpo1f/GkXyy4Ay4hlF5A5DNom5y0W3VwFssourlEKpJQL7cQGKM7+RXqP1QZ8dbCM2Pt7n4yLbTIu16gCSu81DLovYA8AAP//f3YY2QAAAAZJREFUAwCa93H4UVY9YgAAAABJRU5ErkJggg==',
  trophy: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAACEklEQVR4AexYvS4EURQ+NgoRpUKn8wJ6j6Cg4gl4AQ+xKp1OZzWroNCrkEhUiIpiKWxHJIRwTuS7+XZm7u5MZmfndzNfztl7z9xzvvOdzU6mJSX/NATyFtCrwPzc9G+R4GuUl4DvhqKtV4sAj8xTd0WA196a5AHkN8u18RRUSwFmVha/xdKYVMDi+rkATObjoi9Zort3LwDym0VdZrnmZoRYnTz8lkkCmFRAHsUMy4m6zKJes80IDevaJPZaJglgkgCTSJ4kB+oyi3rNNiOUpItZxHoVMKkA/LGYzaKIs8u+AHw+8pvFvlmO8RLgoCL75SfQf/+eAuxXHYWt9q1stf8xLjVsFAA+n32uhde13k2g/AqMq6N5nTOggMrixkl9JxP7LCsXjXEwy+vs2x7gGwnO5fP5zAECvFEWv9IEOqpCCCqrGzMeJx6J2a9HAfaPbgTgGD3Hjajm4SuUUze9a5VWQIkX/0qlgI6BG6eUVHlEEh2VikCiTBkF148Av5NhP2mD9d5DgnsTnvSc+imQtENZx8dSQKV2Eh9sL8so7HZmBPj5XBDAd9/O6pIAnCsO+VgE4hyUV0z9CNz13gQ4vnqWKGA/aKNibY3jAkpu6HdA3fBVPwXCPch3JZYC/MzTPnkQ4PT6RSKRYl1z+R6zIzsVi0DknQVZrB8Bldg9Qqvv5B6XHxB25GN2/RQIdCj3r38AAAD//8A0UAcAAAAGSURBVAMAMYb817vzel4AAAAASUVORK5CYII=',
  key: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAzCAYAAAA6oTAqAAAC9klEQVR4AexWTWsUQRCtWSTExUUxKIpBBCNiAgHBL8hFvaxe16NeBP9BwMvqTdTf4FkFLzkKexByEDx4URElePEDUYwExRAlHib7htSkpme6u3Y2O5kss/Do7ql61f26quit0RD9KjFlTWaVmSozBdxAVWYFXHKuLXrKzNXz+8NekOtEfZDUYu5cOxKeGK+TFn2cKTdVJQZCcu9QINErJpy/GLbbk6TBhek9BR49vZVTDPoDlN+vf5EG8GWM7B0h8CXYNqjRKgalhf7Is/HooZ10tL4j0V954vTKyRQDIRxorvOdnnUzowE4EPLv619MC0dKjOwR9EDr9iS17p5WYdfxBs1ePhj3F/hFKkqIQX1jc+4PzCMsLBJpEDlT3F/ry3hA/EEiFoPSytsj8WkdE8QeJLB1JAZCsABkj2DdefyJOs8XrYBPWVBz9Qh64O2HZQKePP1Gl268DEzQ4bpVy1TXpnmf8vrInsQhosxYewQefYJjD2I0jxaJMT9u1/Wmi5E9p3mbevVxXfSmipnuvjPaNymP38S5Mdp9YNSqRy1mdWmVrrfGQxOpyJr3KK9ParPkB5UY/D05eXaMpo41UkiG29pVTdY4jiLfFawhBP+3MNfA9SZl2cyYpo9pd61rV+69CxgzN18FzYkGNWf2RVhe+EPtB6do9v4ZK+jzShz/Tddf8pvrcWxjY+k/yXfK5Jv2eCPLJLPM+E2IOa4aj502Jsz3jRuM5Ix5ya/u1aP5H0GmGDetfNZbDz8GOFVKjKuHzHo21wgo+b43BP5mj0q+xs5C4JsSw/2D0ewhW+3zd/TY+y8rBMy9+EmI4YIZ3+Rr7BDBSIlhgxy5hn2j5KCG5do157jSR/J9duapxLCzdpSp13Kkn49vs3vFyBrW9IBtI3lYOZfx8d3k++zgMLxiXDVv2lDjHFg7yhhZfJ9d7uMVI53LPq/ElDVDQ5EZvtxKDN9E2cYqM2XLCJ+nygzfRNnGKjNlywifp8oM30TZxqHKzBoAAAD//yYlVPMAAAAGSURBVAMApTGzlNH0p9gAAAAASUVORK5CYII=',
  chest: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAABXUlEQVR4AeyXMY9BQRDH5y5XXHHlNZcrrrxvoNSKQqWi1vEddAo1H0BDpaEVhUJHKyGRKIRCokA0EoZkXpbYZGXCvLcZef+8fWuX+f9/E7LvEPGXGpAGqASUADMBawt9f30cwySbT6sB24awzftlwGyZfikB0qrkYkAyazO7wC8CprOojJ0IDKdrkNZNoBl8vsjJAC4O7aUGpNEoAXEC5h/ErBkH0u//Hkip5CdIqJj/ARLVdb5jzXWStpB4C622hzfSX7oHpG5nB6RqbQnVmrtsph79nEJpAiSq63zHerMkbSFb2q+aVwKvStr2PUrgXjK2X5t7a7lzSoCbIHe/EuAmyN2vBLgJcvcrAW6C3P1KgJsgd7+/BEbzDUjLhY6/BFzch2HNFQE8KAcH/HJrDKT2YAEP6QnrsbbgIG8Gd2XAfCMqY38NILKgnXAc4JMa33REA58v8pcAOozEdQIAAP//6Gh5xwAAAAZJREFUAwAS7IMDZS1HjAAAAABJRU5ErkJggg==',
  fish: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAzCAYAAAA6oTAqAAACfklEQVR4AexWPS9tQRTdbvOal/deqfKikkh8NH4ACg2NiFIU/oAKlYRGovMLRKHRSriIUNCSiESi8FUgEUEoVJd1knOzzZkzc87MOGfcjGTFnLNn9l5r9tr33go10F8Q42szQ2dCZwq4gWCzAi7ZqITTzrT2jdVsYKSAHXImpnt8ofa3pZ1MwTgZL52IgRBjBg4PWouZOKzVemenyATNXf0OpRDlEiObB7C5PXonE+Ashyw/f8f3Ys1jWGcWAyvJ5gFJXUCWm78Ta4h8EM8kBgex2Rek8dGK0c3E6927scZ//zuUsyabKc5HjCvFwIdgqpoHxG2QJ7fIR6ybKgathGfFA2U9gwugqi8VAyFph26Ptj8/udKRdq6I9wkx3JP47uAz8XR1Qntzg3UsjbTQw/oivWwtRbhcnaHfzb+c8ZbNFOfDC2H9RYzoSfgZm3R4e30mQLfPJA4OHKocdTGwls6TqkQ+xCIxEJKVTLVapRg48/R4H3XluzqDGllRUc2ImAQerrYNUIzlP500undWx/DOCak8LeZz/Rx1JqsnUZzvla2xpyxEYsoq7rpu5Xxj/cv3husCRear7M8PNXG4/J4oUghqNZbNoKhRkOiMbzMk/hZUXXxCDJ8frMucIfwWfL45JeD6YI10fBJiVMrLjF3srjSp6iP+I8QcL08rhcRxrRhxhvJ4WHWTcUzMx5+xJyaKNcD54JnHtWLgUxVsZko2E7zW5mRPoiOquFYM1BcBeN62jhdiuFVsBFmL4R7mfs+yBnFXQpDLWgz3cN61bCZAKi/i/dZi4kQ+/A9ifOiCjEPojOxWfHgXOuNDF2QcQmdkt+LDu9AZH7og4/ABAAD//x/KqY8AAAAGSURBVAMAmdlNhSx3jRgAAAAASUVORK5CYII=',
  house: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAzCAYAAAA6oTAqAAADhUlEQVR4AeyY32oTQRTGTyJYa41EBbUYbBCRIIJeqQFbsOhL+AY+gFIVLxXiMwheCL3xohfiRYlVKQhWTCFVaNA2NWKNbUxTbCK2haT5QmbZ7M7O7J9JsoGUfszszOyZ89s5X7ZpkNr4MxY+VhNJ9dZtg7l1IlKLDAySlVSDIF5bYACC4J2WcpjkpXhtYuQs8XRhKNRWPqUw8AeyXSj/JZ4wxxQ5NERYrxebc9sqg0FpwR92EokdDRPtVlv8ZOc+2RolMABhGyU3CtxTwUlhDUAyG5voKpdnGL1H4InE5SuUuD7O1bVTwxQfCGl+wnqVRJ5gUO9IBk8dQh8qFtaJJ8xBWAuhz6TCQ65hUFp2PcIStmpReio85AoGICwxvUfYmKg1rgeIKg85hhF55N7oKBX/VSxZzocOt3hJtYccwdjxiCVJc0LvpeaQ9unHrtG68ZBtGJSWKo8gWZFQem48ZAsGIGxzY82zcbetMR5A3HpICuPFIzJA1R4SwqjwiAxIpYcsYVBanfKIDBilZ8dDXBiAsA2MNc3G29Ua9wOIXQ+ZYNrpEdkD8OIhxG6B6YRHsKlIdj2EGMhXLw0GpeUXjyBRmZCrXljfgAEILnh6kVuhN/W/grshXj6isaDeI/jevrazra0/fWCQYoH9XVN4u0rGfJAjk/H7UONk8N2CSSNpdth4t9pmGlqjz0MbrHdmN4uBBky939O/k2s/AwAI6j/X9dS90AcAA0E/+OTHUkCvR1O3KfHhgS81dnec9t2MNpQ9N0T3s4uNEwEIxC2z5fll8qOQsEhcGNENfp6TwszWT0kkr3Ci2JhzEl8Ik/m+TmceTlLcQn9uTNDI8BEn+7WsVR1fCMN2Tm8R8cTmvba82BhzGtcWjNOg3Vrfh+nWk5ft2z8Z2RPq1rz0ZKanpin9mi9e0ng3iGS8x2l84/36ayFMLHqcHl/NW+pOdJ5y+ZIWD++Nk9UCXQyVuVr9mml5LzmNr21k6LBLIQwWyf5GwxqjPudKxJNxHa7dxMd9PElheDf5dawP0z8ZxU8g/WXJFLEny2zmbcoEggETzPNXn0j0nhDNIeBMOs/9JMOnG+Y9x7cAQWwTzML7OVpJpVxpLvmODlZ3LbWzVXEVl+Xz9NlL5GwpEwxWrpb+kx+F3Ji+/a60/DMD41wYTPhZH7MlEwjyNcEs/ir78lRQKUjYCgRzewAAAP//5MX0fgAAAAZJREFUAwBt//ssBCYkyAAAAABJRU5ErkJggg==',
  heart: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAB4ElEQVR4AexYu07DQBA8LEpKRPgIPoGahop00PIHfBR0UNFQ09JR8QUEKCmRYKeYMJHuZK1zjh93UUa7std7NzvjnJQmTPxTCQwtoFuBw4P93xi8RGI9cM3bx03Au0Df9fMlADlj+FxeB+L19DwQWpuautawByJ7IGqN5qme81UgxXhs1zcUUMkgbQyrj/dAKBnIT2gfzbUfeyBqH61hP0Tto/UbBPTGVPIyCEBmYrG8CDGoYmoDzdkDUes1xz3iyexKaI3ll0QZChjb0X4bfbvxthOUEdG7ezwTg7fP2dFxILgvRNvzLVEt5J1q7vrm6/tnjzh5fgzEwuQjdNHV/UOIQWty5fwFQuS+EG2/V0S1UK5pd+3jUKDrEv0+Vwn0O9/27kkF9CBqbzNcRZLAcFvyrTwvAnY4RA8130y2q8ahRdy8vQTC9rY+vHSFeSmgzKaSJxUwyXZmJ1oGkZZBtD1EbWPDvSOSBKxgEt8yCJiU2e0EuxCwC2FrtdpGrVGGAsp4bLlbAZO4s51oGURaBtF6umyjQ3QT0IfHkJdNwKRvtRPsQsAuhD3b2TaqfNkK6CSGyrMpYJb4t5P8v0TLIFpNFtvosLIR0Ka7zCuB2LTNKms7WZ7dNrpmVUCnMUT+BwAA//9hEgBGAAAABklEQVQDAHbD9IYf1L6bAAAAAElFTkSuQmCC',
  search: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAzCAYAAAA6oTAqAAAD90lEQVR4AdRZTUhVQRSe+9pEbaQiA7WIVqHkol1QZBDUslYRQkS7lv0YKLSJaJHtom0EErXJpWl/okjUQtKUFhGmIumqReu69T04j/HcM//3+l7Bx8ycM+eb8717zrzrq6YS/p04dTZPQcLRYmi0mIuXruadXQdVLMRsEo1RYiAk8dxKwoPFTMx8zW/dHlYx6Ok9WokIIrWKkfoBgfOfPqoYIJYw9XYsk/h1G+31HY1iUEpSP/gS2/Y9ffIoM/HTmbZ4k08Ug4NMAa9ejkY9FTxJcJIQzMtGQYytJ1DzayvfFfBh5p26f2cgC8HgtSuZiz9FYEEMyPApSoCPgJo/2X85t4H28lHiho3vC12LYlwkKJX+u8N55+FuZYKLowq/Uww+MQISICGYx4D3XAyHKcYqZnX5W70/qEdQ85N5ng8NXlcSjvSdNp3TsPMea9/X0fClTjaJwR1vIqQegX/ul1IS4CNMjjzOaB4z4jzko8PF0xCD6xh3vBRApYX+kPzcNjJ0I0kIzqN8kBPAz5DWdTEIJKde07CBGM2OuYS51+OKAH+oEOk8PR9w+qKm3/v8e0TqkfV/JUbkKwvzavXLQh3vXzxXA8d6g5+I3kM4j+dDZ/mM9Sej31ZSkN4fkh+21B4BB8GVD+3jY10MN4auQ0srlN93f7AY6g+MOKRVhCCXIDFl9AgOrQLgDBKDAEKZPUKcqWOUmFYqLf0DcIoZH037HtEPq3ruFHPv/JmMEPM9UrUAnd8oJubdSCeOmeM9zBSHfEw+soti8AqDVwq8ExEooKqRzpP4kY9k57Zame9GnNx3DSG0V8qHfK6xVua7keswyc/fxfC3E4DfGPCuJsWYbGKZmd6NUNM6TKS+dnBhr+k8+EIgipEIqHdolPaE2FBa4AqJce31FuMiCvFDSMh+371WMV0HDm36TRl/7/gSm/bpPYLfqzfW10xbg+1WMWCjesaINQH3Pmo+FIgHFwFrCfnGrGS22pxipGjc+ygV1HwoJD5u+7M0xk1e64IY/Z6fZ7/2g5GEYB4DF3+sEORSEKN/7/A57n1e86h7X6Dn+rZNqAu7pkX8nn2InKJREOPDxJ+Y75q4Py//VBLIT+Px7vZcB9lNY5QYE1mZ9o7dO5QOH+5gMbaadz0hn4RS9gSL4X0UskbP2ZLt2rNT3TzX00D3/jbb9oaPJsFiKLCqUe8lfobeP5hzf8uJ4QnSWu8fzMmuj1su5s3cj003mZ5M6nzLxTwYXcx07G3bbtQQ2kNbLsaYucFh6yEe0vJieMK2ddPFlNlDTRej9w/mth6yPRX4mi4GScRgenGj8B9b/6WYZ1NLBSH4QFpODO8hfpuZhEDMXwAAAP//LCP/PgAAAAZJREFUAwAJztAlmmeO9gAAAABJRU5ErkJggg==',
  users: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAACO0lEQVR4AexYPUsDQRAdRTtLwR9ga2GlYC1W+gOUlHaihdjY+Qss1NJStLFXRBBBBEUkYBBEBCvxqzJ2Cjqb8x3vwu65Cfm4vSTcu5nMzn68fcPmLr0S+KdLoN0C1qzA4EDfjw0+RGz90mI+Y9ZMwGfQVuZ0BgGW+a18K8DD+Y4AnOPy38pX2jcdpeNtAXgcl6qdoYCLfRbiTgVYPpSMsR831wIwAdMGoKyM5Rz2Xy6KYgPnoJSM5fVwjpMAJ2XZzxcBlgnlYCxKxliXGqYN4BwjP8Alwzku/+isKEBVzqx+ryBfCiir4K6mKHB4ei3AyOS8AEPjowI0aqeaQqBRi/MZJ78EcKIY67MTPjl8CuF0SbPLa1sCvH9+zwE8V34VYJZZ9hMKqEQ9wPBEQYCIQHTH6ZJmF1bXBdDxYulxGhmL0kiz3DeaPb7vqVdBgoAGg7vyS0Dls5YTSiPNat+4bHwk3Z+cEoDz9dlsF9B4pWT+rJroyq8CEb/s3xMKqFz//uczvfklNowtlQTQcWLp2X8qFMQG3iZuR1kZq+PEa+P8BAFuCMUPnwBLYyuN6tjr/Z3YwIpV98H38+dXsYH7cjvHTRkBvObwFWCWIfpOBWxlYmI+JE2eDT59XTmu0nIScA2UtXiXQLsV6SrQsQrwqeLjuzaqW0KunWlVPKFA8sfnRJ956sS9vd9K/4wA66Wi1At+40sQaNWuNXKe8AmoHPHL++XGiACPB4vSTOi88Yt/rT4rGL4CzCZE/xcAAP//23c96QAAAAZJREFUAwDd1gqBiwgYlAAAAABJRU5ErkJggg==',
  crown: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAABzUlEQVR4AexXvU7DMBA+EBOiW8TKY8DEwsQKYihPwMprsPAWMCBmJhYmeAF2BhbI1oqpEr1r9EUn2yc5StL8OJW/nG19vvi7z3LbXRr4ZxLQtYGTA5MDNSvQyhHKDvb+Q6i51+DyVgQE39TS5CQAhdVH5vf7goCv51MCNAfr6sbJgboVrLvedKApu18+cgKczc55DHDXbzF7MAX46fo5My4B2jLcHBL1vPZBz+PWkfj3nhNwfpwRILkAXvsAWDnBlcjc8stR88flgFY2lL7pwP5JRoBYCFhWxgjGbSRR83VOOYKA8ADN5z5ur7kpgEmDaCkJKAyBvW7ErSOxYPpP3EYS3fUYy3rAz+DPpOeAX4NuZyo7AHvdqGUs7mcUgua46zHWnJh+ZQExSbfJSU/A1c8rAU1VGvkkVs2ZngNVK9Q2P8oBsRZoe0N4j8SYd0UJiEnUFScNAU+HZxSCVfXZ7YJCsPih3DJn8fV8Gg5oxX3rmw7gt4lE/CvadowplikgZnEfOOMSkC9XO8DR5RsBN3ef1DV4X9eAdn5cDmhlQ+mbDrBd5XHifmlfVH+5apzvFPSRxxuYApgwiJaMgI1dbElfIm+laMk4UMjt4XMNAAD//z0Z5CgAAAAGSURBVAMAJK4uf4FpRuwAAAAASUVORK5CYII=',
  medal: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAzCAYAAAA6oTAqAAAEFklEQVR4AexYS0hVURTdRkRZVvSjKKQoqCS0iQVKoBa8mpo1UImgRs0i+oCJEFGNmhZRENJnIDgK9BGJgzKogZZkSANTCUUrlMSSottbN89jv+N5956flqC43tn33L3XOcu7l/fwFpHBT/WW/CAKBlTK1G0VJ4IoKIvYpLaYK7v3BLvyVlI2ME6rcO/JG8Gq/ALKBh1SLTEQokNmmwMhtrW8LlZMUFUT1O8rIRXK1m3gXFbx6Y4gKG+4SCpsLDpoxBkrBmxfRkdIBdzjkP3E76li+APzQ51TpALuCfS1NeaIONuoJSZbMZ+XvcTvqWK0FvyhuifPdd2/FCsENbFimvr7qC31ZARQ5AoIycYx1Pk09ZT+Ajm6QpAbK+b4644cjrW5y1EXoiD13417ScdDskcmhqdCLnyM9XfT+OC7EAMvmqj1bLHWE0EtECsGSVHgXpLzZA+pPCLXiGsdj4hcMTqLEUTyKHuo59CZ8B0i56muTVqL1xuLsfFQ8/5avmZG7OKRDKLUhbEY7h/EcR4auNed8Q7x6ZHU/jN+jcVkVCsuVB7i7xBFSThl45GwkH14F8O4tUNbj8gLOIsx9ZBPj3gXA99wcA/Ji7m+R2Q++dr5yXDCmrINAb+Oikt+txLyOaLyde55E3O1dmuwe0uuzppU9es2IZdDqzAmyYsYCBHrcA9h7kPLk4yzFoRgfjbgLCZorwjq6gpI4FjjahI4cGcptVffSqPlcEM6D/nlhau9aQKRkxj0O0jG34yRDVArsGTNEmcPWYtBa6HnxWZcxqWbl9H23MUZPrLhsxIDIWKx5uQwPUs9GRuAA0J+fPqO0BnGYrhH0POV9QVUea3YCit25tG5I5vSPgKfiyIjMbJH0gv3jhLZYJpA+G36MhxsPKQtBq3lyyPhbiM+0Ho2HtISAyFibe4RMcfH5PNR4uD3VLHMByG2HooVE+WRkvNFRAOT6T2+7f1GiVOv0thUfJcoP/upoDDlGe43Vw/FisFOZ/Q09wcSXKDgmrGeJr+WGE2uf57mXUwymSSBuVbnVQw8kEg8JoHCwpsZnpptcV7FhJvlHkAcTs7Nh38xc7Nv5SoLYpR/lv9gct48mYftI7Ffos8LMZcffIwVgsaIFSOfnZKP+o3OXlgkCvI5Tl5PVwjWiBVz9HpPjkDpha6cxI48SpSuD5H39Wfk2QsLRCE8yzG+idTZ7v3gJAHNLz8T1ouqF/fEGCtGJPLR9uzEOXis4tPxCOdAbCUGhbMJk9bi+zAWI/e07CHugbgYG5H5bIWAy1iM8A9G9DT3kPCS7ujqEQjgMBbDi0Uset50FPUYbTyCOg4vYjihTezSWnw9ZzG8502/O8NGfAkBl7MYeMcW8Bw24QvOYnxtxAfPghgff8XZ4PgDAAD//xDjHAoAAAAGSURBVAMAX/l5lJaGqScAAAAASUVORK5CYII=',
  medal2: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAzCAYAAAA6oTAqAAAEFklEQVR4AexYS0hVQRieGwRRlElPSY27KV/pjaioRQ8NLIJWEqFhUq3cGZQVVGCbrFYt2gVWFIFRG0HNshAUqoWSWJEL9YYYSvSgjavT/U7M5T/T3HPmdS1B8bvzz8z/mO/O/3kOLmIaP7X5hV4YNFJJXeOV9V4YpEFkUZlMS3GZV7R8BcsEktPITDRc83IKS1gmqCRVIgMiKslMfUDENJbGRZLxauq8Szt2Mxn2rV5LcxnZpwc8b/+VZibD+ooqrZyRZJDt68w0kwF7FKKe6J7Mhj6wPjU4y2TAHsdY770YtzONSmQyBdN1UUt0T2ajtaAP2Z64NtR2PpIIYiLJtE+Msd7UzXAgyBYgkinH1GBP6pb+AD6qROAbSebo24EYxaqlyxDnoyT1141qSUVDokZ+fZn1c+Hj+8Qw+/F5xEeyv511NW1XuhHEApFk4BQGqiXRT9SQTCNiDJ+raIT78tGaDE8kjqKG3h9o9J8hop9srtNaNF6bjImGnuw8TmsGbBuNBBKlJtpkqH5gR2koeWc48AxxqZHU+QO/2mQC0ZKJTEP0GSIJ8ZdMNOIHkg/nZEhuZdNUI2IBazK6GnKpEedkoBsKqiGxmO1zRMwnzq1vhibcU3nIo/Mwu4DNMPhThPmr7DkjU3ui0csviKvUZCVeksGXQikwwskJGRDhdaiGsDba2RF41wIRrGcD1mSe9Y96zZdvMo7Nj54zjpy2DnaroSqN1iOlaT/4l1Vsc8YJiazIoN+R5N3QG2YCxHKsW5NrrSFjMmgt9Dw/jM0YL8xji5esDOjIJJ8RGRDhxXq6nhrdCm4SOUBkLDkF0xraZKhG0POtLWfZdUNs3bKJ7T14LK0j5LNhpEVG1AgvPD75jZmAx+OWAD7HaKIhZTJoLVcawWHDgNYz0ZASGRDhxalG+Bod+169YBR0T2aL+UDEVEORZMI0cqHpJJtItRg/5McPI6y+riaNREoTGzfk8u2/xqLi0oDebDUUSQYnQD8DsAGqD8xtIMuFWoBuXiUyukn/lb9zMt3d3Yxjrkk5JQMNVFdXM47y8vKAprJNzikZHJZqADbW5grOyczVwWV1FsjIvpX/YW3e3Exfb2fkP9HnBZmHd29HEkFnRJIR353uP3is9e6FImEQ3+PEeqpEUCOSzI2r52IcF8+ciuXFEyyx67CPyemfLOzdCwXCgHc5mm9w+BObTI77eN3/kqFeWDzf42MkGe5IR7w3AXTNxkYugOZQ0Qj1h21EBoHZhE5r0XNokxF7WtQQ1UCUjYOI+UyJIJc2Ga4fjOhp2vNcS6qjrUZAgEKbDA3mNvrdBDweo4lGEEfhhAxNaGLbtBatZ02G9rzu7eAgrogglzUZaMcU0BwO4QrWZFwdxEWeBTIuvsVs5PgNAAD//0aduCgAAAAGSURBVAMA7hmLlLwg00cAAAAASUVORK5CYII=',
  medal3: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAzCAYAAAA6oTAqAAAEH0lEQVR4AexZS0hVURTdRoUpKWRGgmk2KjNzYAUNwj7gpElRQSbhoCYNAgd9IPrQQJs1bVAQ4UyqQUE9ApEgGzTwh0EFmTowNSNDSXNwe+vmeex7OO/e89MSjNY9+5679zpnvbOX76KryOBfQ2lZEAcDKmVqxaGzQRyURWxSW8ztHVXB9vUFlA2M0yqsaboTFJZVUjbokGqJgRAdMtscCLGt5XWJYoITZ4Lre/eTCnUbN3Euq/hcVxAcvHmFVNi8+7ARZ6IYsE1OjJMKeMYh+4k/U8XwB+ZHu+dIBTwTGOx4lCPibKOWmGzFfF72En+mitFa8IfqmTzX8/BqohDUJIppHxqkjvTJCKDIFRCSjWO0+1X6lP4CObpCkJso5tS7rhyOorx81IWoTP90417S8ZDskemvcyEXLj+G+mlqZCDE8Jt2etm8R+tEUAskikFSHLiX5DzZQyqPyDXiXscjIleMzmIEkTzKHnp/5EL4HSLnqe5NWovXG4ux8dCTfY18zUjs4pEIUfrGWAz3D+IkDw0/6I98h/j0SHr/kf/GYiLVihuVh/h3iKIknLLxSFjILt7FMG7t0NYj8gLOYkw95NMj3sXANxzcQ/Jirt8jMp9873wynLBuZ37A7+Pi8rHHhHyOuHydZ97ENB4oDEqLVuusSVWfWwm5HFqFCUlexECIWId7CHOfXjyPvGtBCOYXA85iOm9tDa4dKyaBXQ3jJFB8fJjubWjO4C6dzuQhv7os15smEDmJQb+DpHdolmyAWoGKdWucPWQtBq2FnhebcRlrCnJpPi+I+MiGz0oMhIjFUr3TVqeCkwQHhPT8nEXoDGMx3CPo+ZajpdTStM0K9cX5VFu7LuMj8LkoMhIjeySz8IdpIhssEOCUgIXbcLDxkLYYtJYvj4S7jbmg9Ww8pCUGQsTa3CNijo+p9Alx8GeqWOaDEFsPJYqJ88ilk+VEk78ze+wbnaX6+0MZlFx8RlS0NvNcDqpLciNec/VQohhsAP0MIA6R/vQzHgknHC4KLqwFmLJqiTEl/Vf53sWkUikSWGpRXsXAA/VzN0ig+sv5iKcWW5xXMeFmuQcQh5NLc/EvZmn2rVxlRYzyY/kPJpfNyXQOzCT+En1ZiGl7PZUoBI2RKEZ+d0p1fSeTdy8sEgeZS15PVwjWSBTT+vRbjsDltrGc3C2rqLxqbYi+ufTfVmLevbBAHPAux/lSEzM0Mjkf4u3HX4T14urFMzEmihGJfMR7E8DnXGJwAZxDxyM8H7GVGBQuJkxai+/DWIzc07KHuAeSYmxE5rMVAi5jMcI/GNHTvOeFl3RHV49AAIexGF4sYvS7DUQ9RhuPoI7DixhOaBO7tBZfz1kM73nT08FGfAkBl7MYeMcW8Bw24QvOYnxtxAfPihgfn+JicPwBAAD////HZjoAAAAGSURBVAMA8dSGlJiD79AAAAAASUVORK5CYII='};
// nomi dei pesci: presi da pesca.js se c'è (sola lettura), altrimenti dal codice della specie
function nomiPesci(dir) {
  const o = {};
  try { const src = fs.readFileSync(path.join(dir, 'pesca.js'), 'utf8'); for (const m of src.matchAll(/(\w+): \['((?:[^'\\]|\\.)*)', \d/g)) o[m[1]] = m[2].replace(/\\(.)/g, '$1'); } catch (e) {}
  return id => o[id] || (id.charAt(0).toUpperCase() + id.slice(1)).replace(/_/g, ' ');
}

module.exports = {
  name: 'Albo degli eroi',
  version: '1.2',
  author: 'Voxelia',
  description: 'Pagina web con la scheda di ogni eroe (livello, ore di gioco, arena e i dati degli altri plugin) e /albo <nome>',
  defaults: {
    titolo: 'Albo degli eroi',
    nascosti: [],              // nomi da non mostrare mai sulla pagina pubblica
    minutiMinimi: 0,           // sulla pagina solo gli eroi con almeno tanti minuti di gioco contati dall'Albo (0 = tutti)
    indirizzo: ''              // indirizzo pubblico del server per i link in chat, es. https://voxelia.example.it (vuoto = quello da cui gioca ogni eroe)
  },

  setup(api) {
    const C = api.config, K = n => String(n || '').trim().toLowerCase(), MIN = 60000;
    const S = api.store; if (!S.eroi || typeof S.eroi !== 'object') S.eroi = {}; if (!S.privati || typeof S.privati !== 'object') S.privati = {};
    const pesce = nomiPesci(__dirname);
    const bot = p => !!(globalThis.VoxeliaStress && globalThis.VoxeliaStress.bot(p));
    const valido = n => !!K(n) && K(n) !== 'eroe';   // "Eroe" è il nome di chi non l'ha ancora scelto

    // ---------- indirizzo completo per i link in chat (dalla 7.11.1 i link in chat si cliccano) ----------
    // "indirizzo" nel config vince; se è vuoto si usa l'indirizzo da cui ogni eroe ha aperto il gioco
    const origini = new Map();   // id della connessione → es. https://voxelia.example.it
    api.client('(function(){const ID=' + JSON.stringify(api.id) + ';let u=0;const di=()=>VXP.send(ID,"origine",{o:location.origin});' +
      'VXP.on(ID,"origine?",di);setInterval(()=>{try{if(NET.ok&&NET.id&&NET.id!==u){u=NET.id;di()}}catch(e){}},1000)})();');
    api.onClient('origine', (p, d) => { const o = String(d && d.o || ''); if (/^https?:\/\/[A-Za-z0-9.:\[\]-]{1,200}$/.test(o)) origini.set(p.id, o); });
    api.after(500, () => { for (const p of api.players()) p.send('origine?', {}); });   // dopo una Ricarica del plugin
    const linkPagina = (p, resto) => (String(C.indirizzo || '').trim().replace(/\/+$/, '') || origini.get(p.id) || '') + '/plugins/' + api.id + '/' + (resto || '');

    // ---------- ore di gioco ----------
    const visto = new Map();   // id della connessione → ultima volta che il tempo è stato contato
    function conta(p, fine) {
      if (!valido(p.name) || bot(p)) return;
      const k = K(p.name), ora = Date.now(), e = S.eroi[k] || (S.eroi[k] = { nome: p.name, lv: 0, primo: ora, visto: ora, ms: 0, accessi: 0 });
      const da = visto.get(p.id);
      if (da) e.ms += Math.max(0, Math.min(ora - da, 5 * MIN));   // al massimo 5 minuti per controllo (es. server sospeso)
      if (fine) visto.delete(p.id); else visto.set(p.id, ora);
      e.nome = p.name; e.visto = ora; if (p.lv > 0) e.lv = p.lv;
      return e;
    }
    api.on('join', p => { visto.delete(p.id); const e = conta(p); if (e) { e.accessi++; api.save(); } });
    api.on('leave', p => { origini.delete(p.id); if (conta(p, true)) api.save(); });
    api.every(MIN, () => { let n = 0; for (const p of api.players()) if (conta(p)) n++; if (n) api.save(); });
    api.on('start', () => { for (const p of api.players()) conta(p); });   // dopo Ricarica: riprende chi è già online
    api.on('stop', () => { for (const p of api.players()) conta(p, true); api.save(); });

    // ---------- dati degli altri plugin (sola lettura da voxelia-data.json) ----------
    const FILE = process.env.DATA_FILE || path.join(path.dirname((require.main && require.main.filename) || path.join(api.dir, '..', 'server.js')), 'voxelia-data.json');
    let cache = { t: 0, m: 0, plug: {} };
    function plug() {
      const ora = Date.now(); if (ora - cache.t < 5000) return cache.plug;
      cache.t = ora;
      try {
        const m = fs.statSync(FILE).mtimeMs;
        if (m !== cache.m) { const j = JSON.parse(fs.readFileSync(FILE, 'utf8')); cache.m = m; cache.plug = j && j.plug && typeof j.plug === 'object' ? j.plug : {}; }
      } catch (e) { if (cache.m !== -1) api.log('non riesco a leggere ' + FILE + ': ' + e.message); cache.m = -1; }
      return cache.plug;
    }
    const ob = v => v && typeof v === 'object' ? v : {};
    const oggi = () => { const d = new Date(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); };
    const kg = k => k >= 10 ? k.toFixed(0) + ' kg' : k >= 1 ? k.toFixed(1) + ' kg' : Math.round(k * 1000) + ' g';
    // tutto quello che gli altri plugin sanno di un eroe, già pronto da mostrare (solo dati pubblici)
    function extra(k) {
      const P = plug(), o = {};
      const pe = ob(P.pesca), me = ob(pe.pes)[k];
      const rec0 = Object.entries(ob(pe.rec)).filter(([id, r]) => r && K(r.nome) === k && id !== 'stivale');
      if (me || rec0.length) {
        const rec = rec0.map(([id, r]) => pesce(id) + ' ' + kg(+r.kg || 0));
        o.pesca = { pesci: (me || {}).n | 0, kg: Math.round((+(me || {}).kg || 0) * 10) / 10, leggendari: Object.keys(ob((me || {}).leg)).length, record: rec };
      }
      const tv = ob(ob(P.torneo).vittorie)[k]; if (tv && tv.n) o.tornei = tv.n | 0;
      const ts = ob(ob(P.tesoro).vinti)[k]; if (ts && ts.n) o.tesori = ts.n | 0;
      const gi = ob(ob(P.giornaliero).eroi)[k];
      if (gi) o.giornaliero = { serie: oggi() - gi.ultimo <= 1 ? gi.serie | 0 : 0, totale: gi.totale | 0 };
      const h = ob(ob(P.housing).case)[k];
      if (h) {
        o.casa = { nome: String(h.nome || '').slice(0, 28), modello: MODELLI[h.model] || String(h.model || ''), aperta: !!h.aperta };
        if (h.pet) o.pet = { nome: String(h.pet.nome || '').slice(0, 14), specie: SPECIE[h.pet.specie] || String(h.pet.specie || ''), lv: h.pet.lv | 0 };
      }
      return o;
    }
    const nascosto = k => !!S.privati[k] || (Array.isArray(C.nascosti) && C.nascosti.some(n => K(n) === k));

    // ---------- l'elenco degli eroi ----------
    function eroi(pubblica) {
      for (const p of api.players()) conta(p);   // livello e minuti aggiornati per chi è online
      const ar = api.server.leaderboard().filter(s => s.w || s.l), pos = {}, L = {}, on = new Set(api.players().filter(p => !bot(p)).map(p => K(p.name)));
      ar.forEach((s, i) => { pos[K(s.n)] = { pos: i + 1, punti: s.pts | 0, vinte: s.w | 0, perse: s.l | 0 }; });
      const add = (n, base) => { const k = K(n); if (!valido(n) || L[k] || globalThis.VoxeliaStress && globalThis.VoxeliaStress.bot(n)) return; L[k] = Object.assign({ nome: String(n) }, base || {}); };
      for (const k in S.eroi) { const e = S.eroi[k]; add(e.nome, { lv: e.lv, primo: e.primo, visto: e.visto, minuti: Math.floor(e.ms / MIN), accessi: e.accessi }); }
      // eroi che l'Albo non ha ancora visto ma che compaiono altrove (arena e altri plugin)
      for (const s of ar) add(s.n);
      const P = plug();
      for (const o of [ob(ob(P.pesca).pes), ob(ob(P.torneo).vittorie), ob(ob(P.tesoro).vinti), ob(ob(P.giornaliero).eroi)]) for (const v of Object.values(o)) if (v && v.nome) add(v.nome);
      for (const h of Object.values(ob(ob(P.housing).case))) if (h && h.owner) add(h.owner);
      return Object.entries(L).filter(([k, e]) => !pubblica || (!nascosto(k) && (e.minuti || 0) >= (+C.minutiMinimi || 0)))
        .map(([k, e]) => Object.assign(e, { online: on.has(k), arena: pos[k] || null }, extra(k)));
    }
    const ordina = L => L.sort((a, b) => (b.lv || 0) - (a.lv || 0) || (b.minuti || 0) - (a.minuti || 0) || a.nome.localeCompare(b.nome));

    // ---------- /albo ----------
    const ore = m => m >= 60 ? Math.floor(m / 60) + ' h ' + (m % 60) + ' min' : m + ' min';
    const quando = t => { if (!t) return '?'; const m = Math.floor((Date.now() - t) / MIN); return m < 2 ? 'adesso' : m < 60 ? m + ' min fa' : m < 1440 ? Math.floor(m / 60) + ' h fa' : (m < 2880 ? '1 giorno fa' : Math.floor(m / 1440) + ' giorni fa'); };
    function scheda(e) {
      const r = [e.nome + (e.lv ? ' · livello ' + e.lv : '') + (e.online ? ' · online ora' : e.visto ? ' · visto ' + quando(e.visto) : '') + (e.minuti != null ? ' · ' + ore(e.minuti) + ' di gioco' : '')];
      if (e.arena) r.push('Arena: ' + e.arena.punti + ' punti (' + e.arena.pos + '° posto), ' + e.arena.vinte + (e.arena.vinte === 1 ? ' vinta' : ' vinte') + ' e ' + e.arena.perse + (e.arena.perse === 1 ? ' persa' : ' perse'));
      const x = [e.tornei && e.tornei + (e.tornei > 1 ? ' tornei vinti' : ' torneo vinto'), e.tesori && e.tesori + (e.tesori > 1 ? ' tesori trovati' : ' tesoro trovato'),
        e.giornaliero && 'premio giornaliero: ' + (e.giornaliero.serie > 1 ? e.giornaliero.serie + ' giorni di fila, ' : '') + e.giornaliero.totale + ' ritirati'].filter(Boolean);
      if (x.length) r.push(x.join(' · '));
      if (e.pesca) r.push('Pesca: ' + [e.pesca.pesci && e.pesca.pesci + ' pesci, ' + kg(e.pesca.kg), e.pesca.leggendari && e.pesca.leggendari + (e.pesca.leggendari > 1 ? ' leggendari' : ' leggendario'),
        e.pesca.record.length && 'record: ' + e.pesca.record.join(', ')].filter(Boolean).join(' · '));
      if (e.casa) r.push('Casa: ' + (e.casa.nome || e.casa.modello) + (e.casa.nome ? ' (' + e.casa.modello + ')' : '') + (e.pet ? ' · pet: ' + e.pet.nome + ', ' + e.pet.specie.toLowerCase() + ' di livello ' + e.pet.lv : ''));
      return r.join('\n');
    }
    api.command('albo', 'la scheda di un eroe (/albo nome). /albo nascondi per toglierti dalla pagina web', (p, args) => {
      const a = K(args[0]);
      if (a === 'nascondi' || a === 'mostra') {
        if (!valido(p.name)) return 'Scegli prima un nome per il tuo eroe.';
        if (a === 'nascondi') S.privati[K(p.name)] = 1; else delete S.privati[K(p.name)];
        api.save();
        return a === 'nascondi' ? 'La tua scheda non compare più sulla pagina dell\'Albo. In gioco /albo ' + p.name + ' funziona ancora. Per tornare: /albo mostra' : 'La tua scheda è di nuovo sulla pagina dell\'Albo.';
      }
      const chi = args.join(' ').trim() || p.name, k = K(chi);
      if (k !== K(p.name) && nascosto(k)) return chi + ' non compare nell\'Albo.';
      const e = eroi(false).find(e => K(e.nome) === k);
      if (!e) return 'Nell\'Albo non c\'è nessun eroe di nome ' + chi + '.';
      return scheda(e) + (k === K(p.name) ? '\nLa pagina con tutti gli eroi: ' + linkPagina(p) : '');
    });

    // ---------- pagina web (stesso aspetto dei menu di Voxelia e della guida: Georgia, oro con l'ombra ruggine,
    // barra di legno con i chiodi, pannelli col bordo e l'ombra piena sotto, icone voxel del gioco) ----------
    const e = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
    const vi = n => '<i class="vi v-' + n + '" aria-hidden="true"></i>';
    const STILE = '<style>' + String.raw`
:root{--bg:#10131a;--pan:#1b2030;--pan2:#232a40;--btn:#2a3350;--btnh:#3b4770;--fg:#e8ecf4;--mu:#9aa4b8;--ac:#f5b942;--hi:#ffd27a;--lo:#c98a1a;
  --ember:#ff8a5a;--title:#f5b942;--tshadow:#8a3b12;--frame:#8a6a3a;--drop:#2e1d10;--line:#f5b94230;--line2:#f5b94266;--wd3:#4a301b;--good:#4cd07a;
  --f:Georgia,'Times New Roman',serif;color-scheme:dark}
:root[data-theme=light]{--bg:#e8dfc8;--pan:#fbf3df;--pan2:#f3e8cc;--btn:#fff8e6;--btnh:#f6e7c2;--fg:#2a1a0a;--mu:#6a5a3a;--ac:#8a5a0a;--hi:#6a2a1a;--lo:#b9832a;
  --ember:#b0461c;--title:#6a2a1a;--tshadow:#e0c48a;--frame:#b89a62;--drop:#a37a4f;--line:#8a6a3a33;--line2:#8a6a3a77;--good:#1f8a46;color-scheme:light}
@media(prefers-color-scheme:light){:root:not([data-theme=dark]):not([data-theme=light]){--bg:#e8dfc8;--pan:#fbf3df;--pan2:#f3e8cc;--btn:#fff8e6;--btnh:#f6e7c2;
  --fg:#2a1a0a;--mu:#6a5a3a;--ac:#8a5a0a;--hi:#6a2a1a;--lo:#b9832a;--ember:#b0461c;--title:#6a2a1a;--tshadow:#e0c48a;--frame:#b89a62;--drop:#a37a4f;
  --line:#8a6a3a33;--line2:#8a6a3a77;--good:#1f8a46;color-scheme:light}}
*{box-sizing:border-box}
body{margin:0;color:var(--fg);font:400 16px/1.55 var(--f);min-height:100vh;
  background:radial-gradient(ellipse 90% 50% at 50% -10%,#24305466,transparent 70%),
  repeating-linear-gradient(26.565deg,transparent 0 46px,var(--line) 46px 47px),repeating-linear-gradient(-26.565deg,transparent 0 46px,var(--line) 46px 47px),var(--bg)}
a{color:var(--ac)}a:hover{color:var(--hi)}::selection{background:var(--lo);color:#1a1004}
.vi{display:inline-block;width:1.25em;height:1.25em;vertical-align:-.25em;background:center/contain no-repeat;flex-shrink:0;filter:drop-shadow(0 1px 0 #0008);image-rendering:pixelated}
.top{position:sticky;top:0;z-index:10;display:flex;align-items:center;gap:12px;padding:10px clamp(16px,4vw,40px) 11px;
  background:repeating-linear-gradient(180deg,#0000 0 17px,#0000002a 17px 19px),linear-gradient(180deg,#86603b,#5e3f25 55%,#4a301b);
  border-bottom:3px solid #3a2414;box-shadow:inset 0 2px 0 #a37a4f,inset 0 -2px 0 #2e1d1055,0 5px 0 #00000066}
.top::before,.top::after{content:'';position:absolute;top:50%;width:6px;height:6px;margin-top:-3px;background:#d9b36a;box-shadow:inset -2px -2px 0 #8a6420;border-radius:1px}
.top::before{left:6px}.top::after{right:6px}
.brand{display:flex;align-items:center;gap:10px;margin-right:auto;font:bold 1.12rem/1.1 var(--f);font-variant:small-caps;letter-spacing:.04em;color:#ffd27a;text-shadow:2px 2px 0 #8a3b12,0 0 14px #f5b94244}
.brand .vi{width:32px;height:32px}.brand small{display:block;font:italic 400 .72rem var(--f);font-variant:normal;letter-spacing:0;color:#f4e2b8;text-shadow:1px 1px 0 #0008;margin-top:2px}
.btn,.chips button{font:14px var(--f);color:#fff;background:#2a3350;border:1px solid #f5b94288;border-radius:3px;padding:.45em .85em;cursor:pointer;
  box-shadow:0 3px 0 #00000080;transition:transform .08s,box-shadow .08s,background .15s;display:inline-flex;align-items:center;gap:6px}
.btn:hover,.chips button:hover{background:#3b4770}.btn:active,.chips button:active{transform:translateY(2px);box-shadow:0 1px 0 #00000080}
.chips button.on{background:linear-gradient(180deg,#ffd27a,#e0a634 55%,#c98a1a);border-color:#fff0c0;color:#2a1a06;font-weight:bold;text-shadow:0 1px 0 #fff5}
:root[data-theme=light] .chips button:not(.on){background:var(--btn);color:var(--fg);border-color:var(--frame);box-shadow:0 3px 0 var(--drop)}
@media(prefers-color-scheme:light){:root:not([data-theme=dark]) .chips button:not(.on){background:var(--btn);color:var(--fg);border-color:var(--frame);box-shadow:0 3px 0 var(--drop)}}
button:focus-visible,input:focus-visible{outline:2px solid var(--ac);outline-offset:2px}
main{max-width:1180px;margin:0 auto;padding:26px clamp(16px,4vw,40px) 48px}
.kick{display:flex;align-items:center;gap:10px;font:bold .74rem var(--f);text-transform:uppercase;letter-spacing:.16em;color:var(--ember);margin:0}
.kick::after{content:'';width:60px;height:2px;background:linear-gradient(90deg,var(--line2),transparent)}
h1{display:flex;align-items:center;gap:.35em;font:bold clamp(1.9rem,5.5vw,3.1rem)/1.05 var(--f);letter-spacing:.06em;text-transform:uppercase;color:var(--title);text-shadow:3px 3px 0 var(--tshadow);margin:.2em 0 .25em;text-wrap:balance}
h1 .vi{width:1em;height:1em;vertical-align:0}
.sub{margin:0 0 16px;color:var(--mu);max-width:70ch}
.stats{display:flex;flex-wrap:wrap;gap:8px;list-style:none;margin:0 0 22px;padding:0}
.stats li{display:flex;align-items:baseline;gap:6px;color:var(--mu);font-size:.92rem;background:var(--pan);border:1px solid var(--line2);border-radius:4px;padding:.25em .75em;box-shadow:0 3px 0 var(--drop)}
.stats b{font:bold 1.35rem var(--f);color:var(--hi);font-variant-numeric:tabular-nums}
.stats .onl b{color:var(--good)}
.filt{display:flex;flex-wrap:wrap;gap:10px 14px;align-items:center;margin:0 0 20px}
.srch{position:relative;flex:1 1 240px;max-width:380px}
.srch .vi{position:absolute;left:9px;top:50%;transform:translateY(-50%);width:20px;height:20px;pointer-events:none}
.srch input{width:100%;font:15px var(--f);margin:0;padding:.55em .8em .55em 2.3em;border-radius:3px;border:2px solid #3a2414;background:#f4ecd6;color:#2a2010;box-shadow:inset 0 2px 0 #0002,0 2px 0 #a37a4f66}
.srch input::placeholder{color:#8a7a5a}.srch input:focus{outline:none;border-color:var(--ac);box-shadow:0 0 0 2px #f5b94266}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:16px;align-items:start}
.c{min-width:0;background:var(--pan);border:2px solid var(--frame);border-radius:4px;box-shadow:0 5px 0 var(--drop),0 10px 20px #0005;padding:.75em 1em .85em;scroll-margin-top:90px}
.c:target{border-color:var(--ac);box-shadow:0 5px 0 var(--drop),0 0 0 3px #f5b94255,0 10px 20px #0005}
.c header{display:flex;align-items:center;gap:8px;border-bottom:2px solid var(--line2);padding-bottom:.4em;margin-bottom:.45em}
.c h2{display:flex;align-items:center;gap:.4em;flex:1;min-width:0;font:bold 1.2rem/1.2 var(--f);color:var(--title);text-shadow:2px 2px 0 var(--tshadow);margin:0;overflow-wrap:anywhere}
.c h2 .vi{width:1.15em;height:1.15em}
.lv{flex-shrink:0;font:bold .66rem var(--f);text-transform:uppercase;letter-spacing:.08em;color:#2a1a06;background:linear-gradient(180deg,#ffd27a,#c98a1a);border:1px solid #0005;border-radius:2px;box-shadow:0 2px 0 #0007;padding:.2em .5em;white-space:nowrap}
.m{color:var(--mu);font-size:.86rem;margin:0 0 .5em}
.onl{color:var(--good);font-weight:bold}.onl::before{content:'';display:inline-block;width:.55em;height:.55em;margin-right:.35em;background:currentColor;box-shadow:1px 1px 0 #0007;vertical-align:.05em}
.r{display:flex;gap:.6em;align-items:flex-start;margin:.35em 0;font-size:.94rem}.r .vi{margin-top:.1em}
.r b{color:var(--hi)}.r small{display:block;color:var(--mu);font-size:.84rem;line-height:1.35}
.vu{color:var(--mu);font-style:italic;font-size:.92rem;margin:.3em 0}
.vuoto{grid-column:1/-1;text-align:center;color:var(--mu);background:var(--pan);border:2px dashed var(--line2);border-radius:4px;padding:1.4em}
.note{margin-top:26px;color:var(--mu);font-size:.9rem;border-top:2px solid var(--line);padding-top:12px}
code{font:.86rem ui-monospace,Menlo,Consolas,monospace;background:var(--pan2);border:1px solid var(--line);padding:.08em .35em;border-radius:3px;color:var(--hi)}
@media(max-width:600px){.brand small{display:none}.thm span{display:none}.srch{max-width:none;flex-basis:100%}.chips button{font-size:13px;padding:.4em .7em}.g{grid-template-columns:minmax(0,1fr)}}
@media(prefers-reduced-motion:reduce){.btn,.chips button{transition:none}}
` + Object.entries(ICONE).map(([n, u]) => '.v-' + n + '{background-image:url(' + u + ')}').join('') + '</style>';
    const ORDINI = [['lv', 'Livello'], ['ore', 'Ore di gioco'], ['arena', 'Arena'], ['visto', 'Visti di recente'], ['nome', 'Nome']];
    const DISEGNA = String.raw`
function nn(s){return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"})[c])}
function vi(n){return'<i class="vi v-'+n+'" aria-hidden="true"></i>'}
function kg(k){return k>=10?k.toFixed(0)+" kg":k>=1?k.toFixed(1)+" kg":Math.round(k*1000)+" g"}
function ore(m){return m>=60?Math.floor(m/60)+" h "+(m%60)+" min":m+" min"}
function fa(t){const m=Math.floor((Date.now()-t)/60000);return m<2?"adesso":m<60?m+" min fa":m<1440?Math.floor(m/60)+" h fa":(m<2880?"1 giorno fa":Math.floor(m/1440)+" giorni fa")}
function R(i,s){return'<div class="r">'+vi(i)+"<div>"+s+"</div></div>"}
function card(x,i,podio){let h='<article class="c" id="e-'+encodeURIComponent(x.nome.toLowerCase())+'"><header><h2>'+(podio&&i<3?vi(["medal","medal2","medal3"][i]):"")+nn(x.nome)+"</h2>"+(x.lv?'<span class="lv">Liv '+x.lv+"</span>":"")+"</header>";
  const m=[x.online?'<span class="onl">online ora</span>':x.visto?"visto "+fa(x.visto):"",x.minuti!=null?ore(x.minuti)+" di gioco":"",x.primo?"dal "+new Date(x.primo).toLocaleDateString("it-IT"):""].filter(Boolean);
  if(m.length)h+='<p class="m">'+m.join(" · ")+"</p>";const r0=h.length;
  if(x.arena)h+=R("swords","<b>Arena</b> "+x.arena.punti+" punti · "+x.arena.pos+"° posto<small>"+x.arena.vinte+(x.arena.vinte===1?" vinta":" vinte")+" · "+x.arena.perse+(x.arena.perse===1?" persa":" perse")+"</small>");
  if(x.tornei)h+=R("trophy","<b>Tornei vinti</b> "+x.tornei);
  if(x.tesori)h+=R("key","<b>Tesori trovati</b> "+x.tesori);
  if(x.giornaliero)h+=R("chest","<b>Premio giornaliero</b> "+x.giornaliero.totale+" ritirati"+(x.giornaliero.serie>1?"<small>"+x.giornaliero.serie+" giorni di fila</small>":""));
  if(x.pesca)h+=R("fish","<b>Pesca</b> "+[x.pesca.pesci?x.pesca.pesci+" pesci · "+kg(x.pesca.kg):"",x.pesca.leggendari?x.pesca.leggendari+(x.pesca.leggendari>1?" leggendari":" leggendario"):""].filter(Boolean).join(" · ")+(x.pesca.record.length?"<small>Record: "+x.pesca.record.map(nn).join(", ")+"</small>":""));
  if(x.casa)h+=R("house","<b>"+nn(x.casa.nome||"Casa")+"</b> "+(x.casa.aperta?"":"· chiusa")+"<small>"+nn(x.casa.modello)+"</small>");
  if(x.pet)h+=R("heart","<b>"+nn(x.pet.nome)+"</b> "+nn(x.pet.specie).toLowerCase()+" di livello "+x.pet.lv);
  if(h.length===r0)h+='<p class="vu">Nessuna impresa, per ora.</p>';return h+"</article>"}
let D=[],O="lv";try{O=localStorage.getItem("albo_ordine")||O}catch(e){}
const $=id=>document.getElementById(id);
function mostra(){const q=$("q").value.trim().toLowerCase();
  const f={lv:(a,b)=>(b.lv||0)-(a.lv||0),ore:(a,b)=>(b.minuti||0)-(a.minuti||0),arena:(a,b)=>((b.arena||{}).punti||0)-((a.arena||{}).punti||0),visto:(a,b)=>(b.online-a.online)||(b.visto||0)-(a.visto||0),nome:(a,b)=>a.nome.localeCompare(b.nome)}[O]||((a,b)=>0);
  const L=D.filter(x=>!q||x.nome.toLowerCase().includes(q)).sort((a,b)=>f(a,b)||a.nome.localeCompare(b.nome));
  const on=D.filter(x=>x.online).length,top=D.reduce((m,x)=>Math.max(m,x.lv||0),0),min=D.reduce((m,x)=>m+(x.minuti||0),0);
  $("n").innerHTML="<li><b>"+D.length+"</b>"+(D.length===1?"eroe":"eroi")+'</li><li class="onl"><b>'+on+"</b>online</li>"+(top?"<li><b>"+top+"</b>livello più alto</li>":"")+(min>=60?"<li><b>"+Math.floor(min/60)+"</b>ore di gioco in tutto</li>":"");
  const podio=!q&&O!=="nome"&&O!=="visto";
  $("g").innerHTML=L.length?L.map((x,i)=>card(x,i,podio&&(O==="arena"?x.arena:O==="ore"?x.minuti:x.lv))).join(""):'<p class="vuoto">'+(D.length?"Nessun eroe con questo nome.":"Ancora nessun eroe nell'Albo.")+"</p>"}
document.querySelectorAll("#o button").forEach(b=>{b.classList.toggle("on",b.dataset.o===O);b.setAttribute("aria-pressed",b.dataset.o===O);
  b.onclick=()=>{O=b.dataset.o;try{localStorage.setItem("albo_ordine",O)}catch(e){}document.querySelectorAll("#o button").forEach(c=>{c.classList.toggle("on",c===b);c.setAttribute("aria-pressed",c===b)});mostra()}});
$("q").oninput=mostra;
function va(){fetch("dati").then(r=>r.json()).then(j=>{D=j.eroi;mostra();if(location.hash&&!va.f){va.f=1;const el=document.getElementById(location.hash.slice(1));if(el)el.scrollIntoView()}}).catch(()=>{})}
va();setInterval(va,30000);
(function(){const T={auto:"automatico",light:"chiaro",dark:"scuro"},b=$("thm");let v="auto";try{v=localStorage.getItem("voxelia_tema")||"auto"}catch(e){}
  const set=t=>{v=T[t]?t:"auto";if(v==="auto")document.documentElement.removeAttribute("data-theme");else document.documentElement.setAttribute("data-theme",v);b.querySelector("span").textContent="Tema: "+T[v]};
  set(v);b.onclick=()=>{set({auto:"light",light:"dark",dark:"auto"}[v]);try{localStorage.setItem("voxelia_tema",v)}catch(e){}}})();
`;
    api.route('GET', 'dati', (req, res, x) => x.json({ eroi: ordina(eroi(true)) }));
    api.route('GET', '/', (req, res, x) => x.send('<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<meta name="color-scheme" content="dark light"><title>' + e(C.titolo) + ' · Voxelia</title><link rel="icon" href="' + ICONE.scroll + '">' + STILE + '</head><body>' +
      '<header class="top"><div class="brand">' + vi('crown') + '<span>Voxelia<small>' + e(C.titolo) + '</small></span></div>' +
      '<button class="btn thm" id="thm" type="button" aria-label="Cambia tema">◐ <span>Tema: automatico</span></button></header><main>' +
      '<p class="kick">Il registro degli avventurieri</p><h1>' + vi('scroll') + e(C.titolo) + '</h1>' +
      '<p class="sub">Le schede di tutti gli eroi del regno: livello, ore di gioco, arena e le imprese fatte negli altri giochi del server. Si aggiorna da sola.</p>' +
      '<ul class="stats" id="n"></ul>' +
      '<div class="filt"><label class="srch">' + vi('search') + '<input id="q" type="search" placeholder="Cerca un eroe…" autocomplete="off" aria-label="Cerca un eroe"></label>' +
      '<div class="chips" id="o" role="group" aria-label="Ordina">' + ORDINI.map(([v, t]) => '<button type="button" data-o="' + v + '">' + t + '</button>').join('') + '</div></div>' +
      '<div class="g" id="g"><p class="vuoto">Caricamento…</p></div>' +
      '<p class="note">Le ore di gioco si contano da quando c\'è l\'Albo. In gioco: <code>/albo nome</code> mostra una scheda, <code>/albo nascondi</code> ti toglie da questa pagina.</p>' +
      '</main><script>' + DISEGNA + '</script></body></html>'));
  }
};
