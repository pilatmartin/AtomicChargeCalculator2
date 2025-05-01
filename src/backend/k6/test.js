import http from "k6/http";
import { SharedArray } from "k6/data";

export const options = {
    stages: [
        // { duration: "10s", target: 2 },
        { duration: "10m", target: 10 },
        // { duration: "10s", target: 0 }
    ]
}


export default function () {
    // http.get("http://localhost:8000/v1/charges/methods/available");
    
    // http.get("https://acc2-dev.biodata.ceitec.cz/api/v1/charges/methods/available");
    
    // http.post("https://acc2-dev.biodata.ceitec.cz/api/v1/charges/methods/suitable", JSON.stringify({
    //     fileHashes: ["69dd177c7b8f98a5414f9fbc92e57e9c6da79b10b1b4b7296621631187adb18b"],
    //     permissiveTypes: true,
    // }));

    // http.get("https://acc2-dev.biodata.ceitec.cz/api/v1/charges/parameters/eem/available");

    // http.post("https://acc2-dev.biodata.ceitec.cz/api/v1/charges/parameters/best", JSON.stringify({
    //     methodName: "eem",
    //     fileHash: "8711f7313c95a512903554ec399c2ebddcafa4be07ffbb409e5f4ae1663bef31",
    //     permissiveTypes: true,
    // }));

    // http.post("https://acc2-dev.biodata.ceitec.cz/api/v1/files/download", JSON.stringify({
    //     fileHash: "8711f7313c95a512903554ec399c2ebddcafa4be07ffbb409e5f4ae1663bef31",
    // }));

    // http.get("https://acc2-dev.biodata.ceitec.cz/api/v1/files/download/file/8711f7313c95a512903554ec399c2ebddcafa4be07ffbb409e5f4ae1663bef31");

    // http.post("https://acc2-dev.biodata.ceitec.cz/api/v1/charges/calculate", JSON.stringify({
    //     fileHashes: ["d05ebcaa5095199497c2ff53cde6ecc4627f7f3a53e56950f9f73f7e12a16781"],
    //     configs: [],
    //     settings: {
    //         readHetatm: true,
    //         ignoreWater: false,
    //         permissiveTypes: true
    //     }
    // }));
    http.post("http://localhost:8000/api/v1/charges/calculate", JSON.stringify({
        fileHashes: ["d05ebcaa5095199497c2ff53cde6ecc4627f7f3a53e56950f9f73f7e12a16781"],
        configs: [
            {
                "parameters": "EEM_60_Ionescu2013_npa_gas",
                "method": "eem"
              },
              {
                "parameters": "EEM_60_Ionescu2013_npa_pcm",
                "method": "eem"
              },
              {
                "parameters": "EEM_65_Ionescu2013_mpa_gas",
                "method": "eem"
              },
              {
                "parameters": "EEM_65_Ionescu2013_mpa_pcm",
                "method": "eem"
              },
              {
                "parameters": "EEM_00_NEEMP_ccd2016_npa",
                "method": "eem"
              },
              {
                "parameters": "EEM_00_NEEMP_ccd2016_npa2",
                "method": "eem"
              },
              {
                "parameters": "EEM_05_NEEMP_ccd2016_mpa",
                "method": "eem"
              },
              {
                "parameters": "EEM_05_NEEMP_ccd2016_mpa2",
                "method": "eem"
              },
              {
                "parameters": "EEM_10_Cheminf_b3lyp_aim",
                "method": "eem"
              },
              {
                "parameters": "EEM_10_Cheminf_b3lyp_mpa",
                "method": "eem"
              },
              {
                "parameters": "EEM_10_Cheminf_b3lyp_npa",
                "method": "eem"
              },
              {
                "parameters": "EEM_10_Cheminf_hf_aim",
                "method": "eem"
              },
              {
                "parameters": "EEM_10_Cheminf_hf_mpa",
                "method": "eem"
              },
              {
                "parameters": "EEM_10_Cheminf_hf_npa",
                "method": "eem"
              },
              {
                "parameters": "EEM_40_Svob2007_cbeg2",
                "method": "eem"
              },
              {
                "parameters": "EEM_40_Svob2007_chal2",
                "method": "eem"
              },
              {
                "parameters": "EEM_40_Svob2007_cmet2",
                "method": "eem"
              },
              {
                "parameters": "EEM_40_Svob2007_hm2",
                "method": "eem"
              }
        ],
        settings: {
            readHetatm: true,
            ignoreWater: false,
            permissiveTypes: true
        }
    }));
}