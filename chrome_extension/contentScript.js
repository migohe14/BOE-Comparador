

if(typeof init === 'undefined'){
  const init = function(){
    // Add styles (compare strings)
    var style = document.createElement('style');
    style.innerHTML = `
    ins {
      text-decoration: none;
      background-color: #d4fcbc;
    }
  
    del {
      text-decoration: line-through;
      background-color: #fbb6c2;
      color: #555;
    }

    .open_comparator {
      display: block;
      cursor: pointer;
      margin-top: 15px;
      background-color: #123a63;
      color: white;
      border: none;
      border-radius: 5px;
      padding: 10px 15px;
      font-size: 14px;
      font-weight: bold;
      text-align: center;
      transition: background-color 0.3s ease, transform 0.1s ease;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .open_comparator:hover {
        background-color: #09233eff;
    }
    .open_comparator:active {
        transform: scale(0.98);
    }
    .open_comparator:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
    }

    .comparator-popup-container {
      position: fixed;
      width: 90vw;
      max-width: 1200px;
      height: 90vh;
      max-height: 750px;
      background-color: #f9f9f9;
      border-radius: 12px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
      z-index: 10000000000;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    .comparator-popup-header {
      padding: 15px 25px;
      background-color: #fff;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
    }

    .comparator-popup-title {
      color: #333;
      font-weight: 600;
      font-size: 18px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-right: 20px;
    }

    .comparator-popup-actions {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-left: auto;
    }

    .comparator-popup-close {
      cursor: pointer;
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      font-size: 24px;
      color: #888;
      transition: color 0.2s;
      padding: 0;
      line-height: 1;
      margin-left: 15px;
    }
    .comparator-popup-close:hover {
      color: #333;
    }

    .comparator-tooltip {
      position: relative;
      display: inline-block;
    }
    .comparator-tooltip .tooltiptext {
      visibility: hidden; width: 120px; background-color: #555; color: #fff; text-align: center; border-radius: 6px; padding: 5px 0; position: absolute; z-index: 1; bottom: 125%; left: 50%; margin-left: -60px; opacity: 0; transition: opacity .3s;
    }
    .comparator-tooltip .tooltiptext::after {
      content: ""; position: absolute; top: 100%; left: 50%; margin-left: -5px; border-width: 5px; border-style: solid; border-color: #555 transparent transparent transparent;
    }
    .comparator-tooltip:hover .tooltiptext {
      visibility: visible; opacity: 1;
    }

    .comparator-popup-content {
      flex-grow: 1; display: flex; flex-direction: column; padding: 20px 25px; overflow: hidden;
    }

    .comparator-popup-selectors {
      display: flex; justify-content: space-between; gap: 20px; margin-bottom: 20px; flex-shrink: 0;
    }

    .comparator-popup-version-label {
      flex: 1; color: #333; font-weight: 500; font-size: 14px;
    }

    .comparator-popup-select {
      flex: 1; padding: 8px 12px; border: 1px solid #ccc; border-radius: 5px; background-color: #fff; font-size: 14px;
    }

    .comparator-popup-diff-area {
      flex-grow: 1; display: flex; gap: 20px; overflow: hidden;
    }

    .comparator-popup-column {
      flex: 1; background-color: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; overflow-y: auto;
    }
    `;
    document.getElementsByTagName('head')[0].appendChild(style);
  
    // htmlDiff
      var Match,
      calculate_operations,
      consecutive_where,
      create_index,
      diff,
      find_match,
      find_matching_blocks,
      html_to_tokens,
      is_end_of_tag,
      is_start_of_tag,
      is_tag,
      is_whitespace,
      isnt_tag,
      op_map,
      recursively_find_matching_blocks,
      render_operations,
      wrap;
    is_end_of_tag = function (char) {
      return char === ">";
    };
    is_start_of_tag = function (char) {
      return char === "<";
    };
    is_whitespace = function (char) {
      return /^\s+$/.test(char);
    };
    is_tag = function (token) {
      return /^\s*<[^>]+>\s*$/.test(token);
    };
    isnt_tag = function (token) {
      return !is_tag(token);
    };
    Match = class Match {
      constructor(start_in_before1, start_in_after1, length1) {
        this.start_in_before = start_in_before1;
        this.start_in_after = start_in_after1;
        this.length = length1;
        this.end_in_before = this.start_in_before + this.length - 1;
        this.end_in_after = this.start_in_after + this.length - 1;
      }
    };
    html_to_tokens = function (html) {
      var char, current_word, i, len, mode, words;
      mode = "char";
      current_word = "";
      words = [];
      for (i = 0, len = html.length; i < len; i++) {
        char = html[i];
        switch (mode) {
          case "tag":
            if (is_end_of_tag(char)) {
              current_word += ">";
              words.push(current_word);
              current_word = "";
              if (is_whitespace(char)) {
                mode = "whitespace";
              } else {
                mode = "char";
              }
            } else {
              current_word += char;
            }
            break;
          case "char":
            if (is_start_of_tag(char)) {
              if (current_word) {
                words.push(current_word);
              }
              current_word = "<";
              mode = "tag";
            } else if (/\s/.test(char)) {
              if (current_word) {
                words.push(current_word);
              }
              current_word = char;
              mode = "whitespace";
            } else if (/[\w\#@]+/i.test(char)) {
              current_word += char;
            } else {
              if (current_word) {
                words.push(current_word);
              }
              current_word = char;
            }
            break;
          case "whitespace":
            if (is_start_of_tag(char)) {
              if (current_word) {
                words.push(current_word);
              }
              current_word = "<";
              mode = "tag";
            } else if (is_whitespace(char)) {
              current_word += char;
            } else {
              if (current_word) {
                words.push(current_word);
              }
              current_word = char;
              mode = "char";
            }
            break;
          default:
            throw new Error(`Unknown mode ${mode}`);
        }
      }
      if (current_word) {
        words.push(current_word);
      }
      return words;
    };
    find_match = function (
      before_tokens,
      after_tokens,
      index_of_before_locations_in_after_tokens,
      start_in_before,
      end_in_before,
      start_in_after,
      end_in_after
    ) {
      var best_match_in_after,
        best_match_in_before,
        best_match_length,
        i,
        index_in_after,
        index_in_before,
        j,
        len,
        locations_in_after,
        looking_for,
        match,
        match_length_at,
        new_match_length,
        new_match_length_at,
        ref,
        ref1;
      best_match_in_before = start_in_before;
      best_match_in_after = start_in_after;
      best_match_length = 0;
      match_length_at = {};
      for (
        index_in_before = i = ref = start_in_before, ref1 = end_in_before;
        ref <= ref1 ? i < ref1 : i > ref1;
        index_in_before = ref <= ref1 ? ++i : --i
      ) {
        new_match_length_at = {};
        looking_for = before_tokens[index_in_before];
        locations_in_after = index_of_before_locations_in_after_tokens[looking_for];
        for (j = 0, len = locations_in_after.length; j < len; j++) {
          index_in_after = locations_in_after[j];
          if (index_in_after < start_in_after) {
            continue;
          }
          if (index_in_after >= end_in_after) {
            break;
          }
          if (match_length_at[index_in_after - 1] == null) {
            match_length_at[index_in_after - 1] = 0;
          }
          new_match_length = match_length_at[index_in_after - 1] + 1;
          new_match_length_at[index_in_after] = new_match_length;
          if (new_match_length > best_match_length) {
            best_match_in_before = index_in_before - new_match_length + 1;
            best_match_in_after = index_in_after - new_match_length + 1;
            best_match_length = new_match_length;
          }
        }
        match_length_at = new_match_length_at;
      }
      if (best_match_length !== 0) {
        match = new Match(
          best_match_in_before,
          best_match_in_after,
          best_match_length
        );
      }
      return match;
    };
    recursively_find_matching_blocks = function (
      before_tokens,
      after_tokens,
      index_of_before_locations_in_after_tokens,
      start_in_before,
      end_in_before,
      start_in_after,
      end_in_after,
      matching_blocks
    ) {
      var match;
      match = find_match(
        before_tokens,
        after_tokens,
        index_of_before_locations_in_after_tokens,
        start_in_before,
        end_in_before,
        start_in_after,
        end_in_after
      );
      if (match != null) {
        if (
          start_in_before < match.start_in_before &&
          start_in_after < match.start_in_after
        ) {
          recursively_find_matching_blocks(
            before_tokens,
            after_tokens,
            index_of_before_locations_in_after_tokens,
            start_in_before,
            match.start_in_before,
            start_in_after,
            match.start_in_after,
            matching_blocks
          );
        }
        matching_blocks.push(match);
        if (
          match.end_in_before <= end_in_before &&
          match.end_in_after <= end_in_after
        ) {
          recursively_find_matching_blocks(
            before_tokens,
            after_tokens,
            index_of_before_locations_in_after_tokens,
            match.end_in_before + 1,
            end_in_before,
            match.end_in_after + 1,
            end_in_after,
            matching_blocks
          );
        }
      }
      return matching_blocks;
    };
    create_index = function (p) {
      var i, idx, index, len, ref, token;
      if (p.find_these == null) {
        throw new Error("params must have find_these key");
      }
      if (p.in_these == null) {
        throw new Error("params must have in_these key");
      }
      index = {};
      ref = p.find_these;
      for (i = 0, len = ref.length; i < len; i++) {
        token = ref[i];
        index[token] = [];
        idx = p.in_these.indexOf(token);
        while (idx !== -1) {
          index[token].push(idx);
          idx = p.in_these.indexOf(token, idx + 1);
        }
      }
      return index;
    };
    find_matching_blocks = function (before_tokens, after_tokens) {
      var index_of_before_locations_in_after_tokens, matching_blocks;
      matching_blocks = [];
      index_of_before_locations_in_after_tokens = create_index({
        find_these: before_tokens,
        in_these: after_tokens
      });
      return recursively_find_matching_blocks(
        before_tokens,
        after_tokens,
        index_of_before_locations_in_after_tokens,
        0,
        before_tokens.length,
        0,
        after_tokens.length,
        matching_blocks
      );
    };
    calculate_operations = function (before_tokens, after_tokens) {
      var action_map,
        action_up_to_match_positions,
        i,
        index,
        is_single_whitespace,
        j,
        last_op,
        len,
        len1,
        match,
        match_starts_at_current_position_in_after,
        match_starts_at_current_position_in_before,
        matches,
        op,
        operations,
        position_in_after,
        position_in_before,
        post_processed;
      if (before_tokens == null) {
        throw new Error("before_tokens?");
      }
      if (after_tokens == null) {
        throw new Error("after_tokens?");
      }
      position_in_before = position_in_after = 0;
      operations = [];
      action_map = {
        "false,false": "replace",
        "true,false": "insert",
        "false,true": "delete",
        "true,true": "none"
      };
      matches = find_matching_blocks(before_tokens, after_tokens);
      matches.push(new Match(before_tokens.length, after_tokens.length, 0));
      for (index = i = 0, len = matches.length; i < len; index = ++i) {
        match = matches[index];
        match_starts_at_current_position_in_before =
          position_in_before === match.start_in_before;
        match_starts_at_current_position_in_after =
          position_in_after === match.start_in_after;
        action_up_to_match_positions =
          action_map[
            [
              match_starts_at_current_position_in_before,
              match_starts_at_current_position_in_after
            ].toString()
          ];
        if (action_up_to_match_positions !== "none") {
          operations.push({
            action: action_up_to_match_positions,
            start_in_before: position_in_before,
            end_in_before:
              action_up_to_match_positions !== "insert"
                ? match.start_in_before - 1
                : void 0,
            start_in_after: position_in_after,
            end_in_after:
              action_up_to_match_positions !== "delete"
                ? match.start_in_after - 1
                : void 0
          });
        }
        if (match.length !== 0) {
          operations.push({
            action: "equal",
            start_in_before: match.start_in_before,
            end_in_before: match.end_in_before,
            start_in_after: match.start_in_after,
            end_in_after: match.end_in_after
          });
        }
        position_in_before = match.end_in_before + 1;
        position_in_after = match.end_in_after + 1;
      }
      post_processed = [];
      last_op = {
        action: "none"
      };
      is_single_whitespace = function (op) {
        if (op.action !== "equal") {
          return false;
        }
        if (op.end_in_before - op.start_in_before !== 0) {
          return false;
        }
        return /^\s$/.test(
          before_tokens.slice(op.start_in_before, +op.end_in_before + 1 || 9e9)
        );
      };
      for (j = 0, len1 = operations.length; j < len1; j++) {
        op = operations[j];
        if (
          (is_single_whitespace(op) && last_op.action === "replace") ||
          (op.action === "replace" && last_op.action === "replace")
        ) {
          last_op.end_in_before = op.end_in_before;
          last_op.end_in_after = op.end_in_after;
        } else {
          post_processed.push(op);
          last_op = op;
        }
      }
      return post_processed;
    };
    consecutive_where = function (start, content, predicate) {
      var answer, i, index, last_matching_index, len, token;
      content = content.slice(start, +content.length + 1 || 9e9);
      last_matching_index = void 0;
      for (index = i = 0, len = content.length; i < len; index = ++i) {
        token = content[index];
        answer = predicate(token);
        if (answer === true) {
          last_matching_index = index;
        }
        if (answer === false) {
          break;
        }
      }
      if (last_matching_index != null) {
        return content.slice(0, +last_matching_index + 1 || 9e9);
      }
      return [];
    };
    wrap = function (tag, content) {
      var length, non_tags, position, rendering, tags;
      rendering = "";
      position = 0;
      length = content.length;
      while (true) {
        if (position >= length) {
          break;
        }
        non_tags = consecutive_where(position, content, isnt_tag);
        position += non_tags.length;
        if (non_tags.length !== 0) {
          rendering += `<${tag}>${non_tags.join("")}</${tag}>`;
        }
        if (position >= length) {
          break;
        }
        tags = consecutive_where(position, content, is_tag);
        position += tags.length;
        rendering += tags.join("");
      }
      return rendering;
    };
    op_map = {
      equal: function (op, before_tokens, after_tokens) {
        return before_tokens
          .slice(op.start_in_before, +op.end_in_before + 1 || 9e9)
          .join("");
      },
      insert: function (op, before_tokens, after_tokens) {
        var val;
        val = after_tokens.slice(op.start_in_after, +op.end_in_after + 1 || 9e9);
        return wrap("ins", val);
      },
      delete: function (op, before_tokens, after_tokens) {
        var val;
        val = before_tokens.slice(op.start_in_before, +op.end_in_before + 1 || 9e9);
        return wrap("del", val);
      }
    };
    op_map.replace = function (op, before_tokens, after_tokens) {
      return (
        op_map.insert(op, before_tokens, after_tokens) +
        op_map.delete(op, before_tokens, after_tokens)
      );
    };
    render_operations = function (before_tokens, after_tokens, operations) {
      var i, len, op, rendering;
      rendering = "";
      for (i = 0, len = operations.length; i < len; i++) {
        op = operations[i];
        rendering += op_map[op.action](op, before_tokens, after_tokens);
      }
      return rendering;
    };
    diff = function (before, after) {
      var ops;
      if (before === after) {
        return before;
      }
      before = html_to_tokens(before);
      after = html_to_tokens(after);
      ops = calculate_operations(before, after);
      return render_operations(before, after, ops);
    };
    diff.html_to_tokens = html_to_tokens;
    diff.find_matching_blocks = find_matching_blocks;
    find_matching_blocks.find_match = find_match;
    find_matching_blocks.create_index = create_index;
    diff.calculate_operations = calculate_operations;
    diff.render_operations = render_operations;
    if (typeof define === "function") {
      define([], function () {
        return diff;
      });
    } else if (typeof module !== "undefined" && module !== null) {
      module.exports = diff;
    } else {
      this.htmldiff = diff;
    }
  // end htmlDiff

  // Check params url ==> search "disposiciones legales"
  let literals = [ 
    {type: "dt", text: "Disposición transitoria"}, 
    {type: "df", text: "Disposición final"}, 
    {type: "da", text: "Disposición adicional"}
  ]
  let queryUrl = window.location.href.split("#search=")[1]
  if(queryUrl) {
      let typeDis = queryUrl.split("-")[0];
      let idDis = Number(queryUrl.split("-")[1]);
      
      let filterLawString = literals.filter(dis => dis.type === typeDis)[0].text;
      
      let dSelected = idDis ? Array.from(document.querySelectorAll("h5")).filter(element => element.textContent.includes(filterLawString))[idDis - 1] : Array.from(document.querySelectorAll("h5")).filter(element => element.textContent.includes(filterLawString))[0];
      if(dSelected) {
          window.scrollTo( 0, dSelected.offsetTop );  
      }
      // Reset url
      var newURL = location.href.split("#")[0];
      window.history.pushState('object', document.title, newURL);
  }
  // 

  // Insert links to "disposiciones legales", generate ==> ej. #search=df-1

 let legalIds = [ 
    {id: 1, names: ['única', 'primera', '1']}, 
    {id: 2, names: ['segunda', '2']}, 
    {id: 3, names: ['tercera', '3']},
    {id: 4, names: ['cuarta', '4']},
    {id: 5, names: ['quinta', '5']},
    {id: 6, names: ['sexta', '6']},
    {id: 7, names: ['séptima', '7']},
    {id: 8, names: ['octava', '8']},
    {id: 9, names: ['novena', '9']},
    {id: 10, names: ['décima', '10']},
    {id: 11, names: ['undécima', '11']},
    {id: 12, names: ['duodécima', '12']},
    {id: 13, names: ['decimotercera', '13']},
    {id: 14, names: ['decimocuarta', '14']},
    {id: 15, names: ['decimoquinta', '15']},
    {id: 16, names: ['decimosexta', '16']},
    {id: 17, names: ['decimoséptima', '17']},
    {id: 18, names: ['decimoctava', '18']},
    {id: 19, names: ['decimonovena', '19']},
    {id: 20, names: ['vigésima', '20']}
  ]

for(let i = 0; i < document.getElementsByClassName("nota_pie_2").length; i++){

    document.getElementsByClassName("nota_pie_2")[i].innerText.split(" ").map((item, index) => {
        if(item.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,"") === "disposicion") {
            let indexStr = index;
            
            let labelResult = `disposición ${document.getElementsByClassName("nota_pie_2")[i].innerText.split(" ")[indexStr + 1]} ${document.getElementsByClassName("nota_pie_2")[i].innerText.split(" ")[indexStr + 2]}`
            let lawLink;
            let currentNote = document.getElementsByClassName("nota_pie_2")[i];
            let prevNote = document.getElementsByClassName("nota_pie_2")[i].previousElementSibling

            if (currentNote?.getElementsByTagName('a')[0]) {
                lawLink = currentNote.getElementsByTagName('a')[0].href;
            } else if(!currentNote?.getElementsByTagName('a')[0] && prevNote?.getElementsByTagName('a')[0]) {
                lawLink = prevNote.getElementsByTagName('a')[0].href;
            } else if(!currentNote?.getElementsByTagName('a')[0] && !prevNote?.getElementsByTagName('a')[0]) {
              lawLink = window.location.href;
            }
        

            if(lawLink) {
                let type = literals.filter(literal => literal.text.includes(labelResult.split(" ")[1]))[0]?.type;
                let id = legalIds.filter(legalId => legalId.names.includes(labelResult.split(" ")[2].split(".")[0]))[0]?.id;

                labelResult = labelResult.replace(")", "");
                document.getElementsByClassName("nota_pie_2")[i].innerHTML = document.getElementsByClassName("nota_pie_2")[i].innerHTML.replace(new RegExp(labelResult, "ig"), `<a href="${lawLink}#search=${type}-${id}" target="_blank">${labelResult}</a>`)
            }
     
            
        }      
    });
}


  // Add compare button
    let articles = document.querySelectorAll("form.lista.formBOE > fieldset");
    if(articles && articles.length > 0) {
      for(let i = 0; i < articles.length; i++) {
        let compareButton = document.getElementById(articles[i].parentElement.action.split("#")[1]);
    
        if(compareButton && !document.getElementById(`open_comparator${articles[i].parentElement.action.split("#")[1]}`)) {
          const button = document.createElement('button');
          button.title = "Comparar";
          button.className = "open_comparator";
          button.id = `open_comparator${articles[i].parentElement.action.split("#")[1]}`;
          button.value = articles[i].parentElement.action.split("#")[1];
          button.textContent = "Comparar";
          compareButton.appendChild(button);
        }
      }

  // Event click - compare button & build popup
      let elementos = document.getElementsByClassName('open_comparator');
      for(let el of elementos) {
        el.addEventListener('click', async (eventId) => {
          eventId.target.disabled = true;
  
          const articleId = eventId.target.value;
          const queryString = window.location.search;
          const urlParams = new URLSearchParams(queryString);
          const urlId = urlParams.get('id');
  
          try {
            var spinner = document.createElement("DIV");
            spinner.innerHTML = `<div id="spinner_loading" style="width: 100%;height: 100%;position: fixed;top: 0; left: 0; background-color: rgba(0,0,0,0.4);cursor: progress;z-index: 9999999999;"></div>`;
            document.body.appendChild(spinner);

            const response = await fetch(`https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/${urlId}/texto/bloque/${articleId}`, {
              headers: {
                'Accept': 'application/xml'
              }
            });
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const xmlString = await response.text();
  
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  
            if (xmlDoc.getElementsByTagName("parsererror").length) {
              throw new Error('Error parsing XML');
            }
            
            const versionNodes = Array.from(xmlDoc.getElementsByTagName('version')).reverse(); // Newest first
  
            if (versionNodes.length < 2) {
              alert('No hay suficientes versiones para comparar.');
              document.getElementById('spinner_loading').remove();
              eventId.target.disabled = false;
              return;
            }
  
            const formatDate = (dateStr) => { // e.g. "20150722"
                if (!dateStr || dateStr.length !== 8) return dateStr;
                return `${dateStr.substring(6, 8)}/${dateStr.substring(4, 6)}/${dateStr.substring(0, 4)}`;
            };
  
            const ReformsIds = versionNodes.map((versionNode, index) => {
                const fecha_publicacion = versionNode.getAttribute('fecha_publicacion');
                const fecha_vigencia = versionNode.getAttribute('fecha_vigencia');

                let label = '';
                if (index === 0) {
                    label = `Última actualización, publicada el ${formatDate(fecha_publicacion)}, en vigor a partir del ${formatDate(fecha_vigencia)}.`;
                } else if (index === versionNodes.length - 1) {
                    label = `Texto original, publicado el ${formatDate(fecha_publicacion)}, en vigor a partir del ${formatDate(fecha_vigencia)}.`;
                } else {
                    label = `Modificación publicada el ${formatDate(fecha_publicacion)}, en vigor a partir del ${formatDate(fecha_vigencia)}.`;
                }

                let htmlContent = '';
                for (const child of versionNode.childNodes) {
                    if (child.nodeType === 1) { // ELEMENT_NODE
                        htmlContent += child.outerHTML;
                    } else if (child.nodeType === 3) { // TEXT_NODE
                        htmlContent += child.textContent;
                    }
                }

                return {
                    value: fecha_publicacion,
                    label: label,
                    html: htmlContent.trim()
                };
            });
  
            // Build the popup
            let optionStringTag = ReformsIds
                .filter((_, i) => i !== 0) // All except the most recent one
                .map((option, i) => `<option value="${option.value}" ${i === 0 ? 'selected' : ''}>${option.label}</option>`)
                .join('');
  
            let htmlDiffResult = htmldiff(ReformsIds[1].html, ReformsIds[0].html);
            let reformSelectedTemplate = ReformsIds[1].html;
  
            let selectTagString = `<select id='popup_reforms_${articleId}' name="select" class="comparator-popup-select">${optionStringTag}</select>`;
            var popupWrapper = document.createElement("DIV");
            popupWrapper.id = `popup_wrapper_${articleId}`;

            var articleTitle = document.querySelector(`#${articleId} > h5`).innerText;
            var lawTitle = document.getElementsByClassName("documento-tit")[0].innerText;
            var twitterLawTitle = `${articleTitle}  ${lawTitle}`;
            const newTabIconUrl = chrome.runtime.getURL('images/new-tab.png');
            
            popupWrapper.innerHTML = `
            <div id="popup_reforms_container_${articleId}" class="comparator-popup-container">
              <div class="comparator-popup-header">
                  <div class="comparator-popup-title">${articleTitle}</div>
                  <div class="comparator-popup-actions">
                      <a class="comparator-tooltip" title="Compartir en Twitter" href="https://twitter.com/intent/tweet?text=Última reforma: ${twitterLawTitle.length > 200 ? twitterLawTitle.substring(0, 200) + '...' : twitterLawTitle} 📚 %23boe_comparador https://elboe.es/comparator?art=${articleId}%26id=${urlId}%26prev=${ReformsIds[1].value}%26current=${ReformsIds[0].value}" target="_blank">
                          <img src="https://firebasestorage.googleapis.com/v0/b/elboe-es.appspot.com/o/twitter.png?alt=media&token=28300ebc-2aa3-44ac-8229-b42919a28eb6" width="25px">
                      </a>
                      <a class="comparator-tooltip" title="Abrir en una nueva pestaña" href="https://elboe.es/comparator?art=${articleId}&id=${urlId}&prev=${ReformsIds[1].value}&current=${ReformsIds[0].value}" target="_blank">
                          <img style="cursor: pointer;" src="${newTabIconUrl}" width="25px">
                      </a>
                  </div>
                  <button class="comparator-popup-close" onclick="document.getElementById('open_comparator${articleId}').disabled = false; document.getElementById('popup_wrapper_${articleId}').remove();">&times;</button>
              </div>
              <div class="comparator-popup-content">
                  <div class="comparator-popup-selectors">
                      <div class="comparator-popup-version-label">${ReformsIds[0].label}</div>
                      ${selectTagString}
                  </div>
                  <div class="comparator-popup-diff-area">
                      <div id="newHTML" class="comparator-popup-column"><div>${htmlDiffResult}</div></div>
                      <div id="originalHTML" class="comparator-popup-column"><div>${reformSelectedTemplate}</div></div>
                  </div>
              </div>
            </div>`;
            document.body.appendChild(popupWrapper);
            document.getElementById('spinner_loading').remove();
            document.getElementById(`popup_reforms_${articleId}`).addEventListener('change', (reformEvent) => {
                const selectedReform = ReformsIds.find((re) => re.value === reformEvent.target.value);
                if (selectedReform) {
                    htmlDiffResult = htmldiff(selectedReform.html, ReformsIds[0].html);
                    reformSelectedTemplate = selectedReform.html;

                    document.querySelector("#newHTML > div").innerHTML = htmlDiffResult;
                    document.querySelector("#originalHTML > div").innerHTML = reformSelectedTemplate;
                }
            });
  
          } catch (error) {
              console.error('Error al obtener o procesar las versiones del artículo:', error);
              alert('Error al cargar las versiones del artículo. Por favor, inténtelo de nuevo.');
              const spinner = document.getElementById('spinner_loading');
              if (spinner) spinner.parentElement.remove();
              eventId.target.disabled = false;
          }
        });
  
      }
  
    }
  }
  init();
}
