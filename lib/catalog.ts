export type CategoryId = "racks" | "pdu" | "ups" | "batteries" | "cooling" | "servers" | "storage" | "network";
export const categories: {id: CategoryId; name: string; subtitle: string; icon: string}[] = [
  {id:"racks",name:"Серверные шкафы",subtitle:"Основа вашей инфраструктуры",icon:"cabinet"},
  {id:"pdu",name:"Распределение питания",subtitle:"Блоки PDU для серверных стоек",icon:"plug"},
  {id:"ups",name:"Источники бесперебойного питания",subtitle:"Защита и резервирование питания",icon:"zap"},
  {id:"batteries",name:"Аккумуляторы",subtitle:"Резерв энергии для ИБП",icon:"battery"},
  {id:"cooling",name:"Системы охлаждения",subtitle:"Управление тепловой нагрузкой",icon:"snowflake"},
  {id:"servers",name:"Серверы",subtitle:"Вычислительные ресурсы под задачу",icon:"server"},
  {id:"storage",name:"Системы хранения данных",subtitle:"Хранение, доступ и защита данных",icon:"database"},
  {id:"network",name:"Сетевое оборудование",subtitle:"Связность на каждом уровне",icon:"network"},
];
export type Product = {id:string; name:string; brand:string; category:CategoryId; description:string; specs:{label:string;value:string}[]; source:string; image?:string; priceUsd:null | number; note?:string};
// Verified reference products are supplied in this file before release.
export const products: Product[] = [
  {
    "id": "apc-ar3100b2",
    "name": "APC NetShelter SX Gen 2 AR3100B2",
    "brand": "APC",
    "category": "racks",
    "description": "Серверный шкаф для размещения оборудования в стойке.",
    "specs": [
      {
        "label": "Высота",
        "value": "42U"
      },
      {
        "label": "Габариты В×Ш×Г",
        "value": "1991 × 600 × 1070 мм"
      },
      {
        "label": "Исполнение",
        "value": "С боковыми панелями"
      },
      {
        "label": "Цвет",
        "value": "Чёрный"
      }
    ],
    "source": "https://www.se.com/uk/en/product/AR3100B2/apc-netshelter-sx-server-rack-gen-2-42u-1991h-x-600w-x-1070d-mm-with-sides-black/",
    "priceUsd": null,
    "note": "Высота шкафа — 42U. Точные аксессуары и комплектация проверяются по спецификации."
  },
  {
    "id": "apc-ap8853",
    "name": "APC NetShelter Metered Rack PDU AP8853",
    "brand": "APC",
    "category": "pdu",
    "description": "Блок распределения питания с измерением электрических параметров.",
    "specs": [
      {
        "label": "Формат",
        "value": "0U"
      },
      {
        "label": "Вход",
        "value": "1 фаза, 230 В / 32 А"
      },
      {
        "label": "Мощность",
        "value": "7,4 кВт"
      },
      {
        "label": "Выходы",
        "value": "36 × C13 + 6 × C19"
      }
    ],
    "source": "https://www.se.com/nl/en/product/AP8853/apc-netshelter-metered-rack-pdu-0u-1-phase-7-4kw-230v-32a-36-c13-and-6-c19-outlets-iec-309-2p%2Be-cord/",
    "priceUsd": null,
    "note": "Подключение и разъёмы необходимо сопоставить с требованиями стойки."
  },
  {
    "id": "apc-srt10kxli",
    "name": "APC Smart-UPS On-Line SRT10KXLI",
    "brand": "APC",
    "category": "ups",
    "description": "Источник бесперебойного питания с двойным преобразованием.",
    "specs": [
      {
        "label": "Мощность",
        "value": "10 кВА / 10 кВт"
      },
      {
        "label": "Топология",
        "value": "On-line, двойное преобразование"
      },
      {
        "label": "Выходы",
        "value": "6 × C13 + 4 × C19"
      },
      {
        "label": "Установка",
        "value": "Rack/Tower; направляющие отдельно"
      }
    ],
    "source": "https://www.se.com/uk/en/product/SRT10KXLI/apc-smartups-online-10kva-10kw-tower-230v-400v-6x-c13%2B4x-c19-iec-outlets-network-card%2Bsmartslot-extended-runtime-w-o-rail-kit/",
    "priceUsd": null,
    "note": "Автономность зависит от нагрузки и батарей. Направляющие для стойки приобретаются отдельно."
  },
  {
    "id": "apc-srt192bp2",
    "name": "APC Smart-UPS SRT192BP2",
    "brand": "APC",
    "category": "batteries",
    "description": "Внешний батарейный блок для совместимых ИБП Smart-UPS SRT.",
    "specs": [
      {
        "label": "Тип",
        "value": "Внешний батарейный блок"
      },
      {
        "label": "Напряжение",
        "value": "192 В"
      },
      {
        "label": "Совместимость",
        "value": "SRT On-Line 8 / 10 кВА"
      },
      {
        "label": "Расширение",
        "value": "До 10 батарейных блоков"
      }
    ],
    "source": "https://www.se.com/uk/en/product/SRT192BP2/apc-smartups-online-srt-battery-pack-for-8-10kva-extended-runtime-model-192v/",
    "priceUsd": null,
    "note": "Проверьте точную модель ИБП перед выбором батарейного блока."
  },
  {
    "id": "rittal-3312130",
    "name": "Rittal LCP Rack CW 3312.130",
    "brand": "Rittal",
    "category": "cooling",
    "description": "Система водяного охлаждения серверного шкафа с модульными вентиляторами.",
    "specs": [
      {
        "label": "Охлаждение",
        "value": "Водяное, для серверного шкафа"
      },
      {
        "label": "Базовая мощность",
        "value": "10 кВт, один вентилятор"
      },
      {
        "label": "Масштабирование",
        "value": "До 30 кВт с двумя дополнительными вентиляторами"
      },
      {
        "label": "Габариты Ш×В×Г",
        "value": "300 × 2000 × 1000 мм"
      }
    ],
    "source": "https://www.rittal.com/com-en/products/PG20231215KLI101/PG20231245KLI1005/PG20240116KLI207/PRO29834?variantId=3312130",
    "priceUsd": null,
    "note": "30 кВт достижимы с двумя дополнительными вентиляторными модулями. Базовая конфигурация с одним вентилятором — 10 кВт."
  },
  {
    "id": "dell-poweredge-r650",
    "name": "Dell PowerEdge R650",
    "brand": "Dell",
    "category": "servers",
    "description": "Серверная платформа 1U для подбора конфигурации под рабочую нагрузку.",
    "specs": [
      {
        "label": "Формат",
        "value": "1U"
      },
      {
        "label": "Процессоры",
        "value": "До 2 × Intel Xeon Scalable 3-го поколения"
      },
      {
        "label": "Память",
        "value": "32 слота DDR4 DIMM"
      },
      {
        "label": "Передние отсеки",
        "value": "До 10 × 2,5″, зависит от конфигурации"
      }
    ],
    "source": "https://www.delltechnologies.com/asset/nl-nl/products/servers/technical-support/dell-emc-poweredge-r650-spec-sheet.pdf",
    "priceUsd": null,
    "note": "Указаны возможности платформы. Процессоры, память и накопители подбираются отдельно."
  },
  {
    "id": "dell-powervault-me5024",
    "name": "Dell PowerVault ME5024",
    "brand": "Dell",
    "category": "storage",
    "description": "Система хранения данных с конфигурацией накопителей и контроллеров по задаче.",
    "specs": [
      {
        "label": "Формат",
        "value": "2U"
      },
      {
        "label": "Накопители",
        "value": "24 отсека 2,5″"
      },
      {
        "label": "Подключение",
        "value": "SAS, FC или iSCSI — по контроллерам"
      },
      {
        "label": "Управление",
        "value": "PowerVault Manager"
      }
    ],
    "source": "https://infohub.delltechnologies.com/en-us/l/dell-powervault-me5024-and-vmware-horizon-8-with-500-vdi-users/me5024-overview/",
    "priceUsd": null,
    "note": "Интерфейс зависит от выбранных контроллеров; накопители и контроллеры уточняются по ТЗ."
  },
  {
    "id": "cisco-c9300-24t",
    "name": "Cisco Catalyst C9300-24T",
    "brand": "Cisco",
    "category": "network",
    "description": "Коммутатор доступа для корпоративной сетевой инфраструктуры.",
    "specs": [
      {
        "label": "Порты",
        "value": "24 × 10/100/1000 Мбит/с Ethernet"
      },
      {
        "label": "Штатный блок питания",
        "value": "350 Вт AC"
      },
      {
        "label": "Стек",
        "value": "StackWise-480"
      },
      {
        "label": "Питание стека",
        "value": "StackPower"
      }
    ],
    "source": "https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9300/hardware/install/b_c9300_hig/Product-overview.html",
    "priceUsd": null,
    "note": "Коммутатор доступа. Лицензия и uplink-модуль уточняются отдельно."
  }
];
export const categoryName=(id:string)=>categories.find(c=>c.id===id)?.name ?? "Оборудование";
