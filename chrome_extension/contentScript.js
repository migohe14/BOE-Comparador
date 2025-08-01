

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
    }`;
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
          compareButton.innerHTML+= `<button title="Comparar" class="open_comparator"
          id="open_comparator${articles[i].parentElement.action.split("#")[1]}"
          value="${articles[i].parentElement.action.split("#")[1]}" style="
          display: block;
          padding: 0;
          cursor: pointer;
          margin-top: 15px;
          color: #912600;
          height: 33px;
          padding: 8px;
           border: 1px solid #ddd;
           border-radius: 5px;
          ">Comparar</button>`;
        }
      }

  // Event click - compare button & build popup
      let elementos = document.getElementsByClassName('open_comparator');
      for(let el of elementos) {
        el.addEventListener('click', async (eventId) => {
          var spinner = document.createElement("DIV");
          spinner.innerHTML = `<div id="spinner_loading" style="width: 100%;height: 100%;position: absolute;top: 0;background-color: black;opacity: 0.2;cursor: progress;pointer-events: all !important;z-index: 9999999999;"></div>`;
          document.body.appendChild(spinner);
    
          eventId.target.disabled = true;
  
          const articleId = eventId.target.value;
          const queryString = window.location.search;
          const urlParams = new URLSearchParams(queryString);
          const urlId = urlParams.get('id');
  
          try {
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
  
            let selectTagString = `<select id='popup_reforms_${articleId}' name="select">${optionStringTag}</select>`;
            var popup_reforms = document.createElement("DIV");
            var articleTitle = document.querySelector(`#${articleId} > h5`).innerText;
            var lawTitle = document.getElementsByClassName("documento-tit")[0].innerText;
            var twitterLawTitle = `${articleTitle}  ${lawTitle}`;
            
            popup_reforms.innerHTML = `<div id="popup_reforms_container${articleId}" style="width: 1200px; height: 600px; position: absolute; padding: 10px; border-radius: 10px; border: 1px solid #ddd; padding: 1em; background-color: #f8f8f8; left: 0; right: 0; margin: auto; top: ${eventId.layerY - 350}px; z-index: 10000000000;">
              <button style="margin-left: 96%;cursor: pointer;width: 32px;height: 32px;opacity: 0.3;border: none;font-size: 20px;" onclick="document.getElementById('open_comparator${articleId}').disabled = false;this.parentElement.remove();">X</button>
              <div style="margin-left: 88%;">
                <style>.tooltip{position:relative;display:inline-block;border-bottom:1px dotted black}.tooltip .tooltiptext{visibility:hidden;width:120px;background-color:#555;color:#fff;text-align:center;border-radius:6px;padding:5px 0;position:absolute;z-index:1;bottom:125%;left:50%;margin-left:-60px;opacity:0;transition:opacity .3s}.tooltip .tooltiptext::after{content:"";position:absolute;top:100%;left:50%;margin-left:-5px;border-width:5px;border-style:solid;border-color:#555 transparent transparent transparent}.tooltip:hover .tooltiptext{visibility:visible;opacity:1}</style>
                <a class="tooltip" href="https://twitter.com/intent/tweet?text=Última reforma: ${twitterLawTitle.length > 200 ? twitterLawTitle.substring(0, 200) + '...' : twitterLawTitle} 📚 %23boe_comparador https://elboe.es/comparator?art=${articleId}%26id=${urlId}%26prev=${ReformsIds[1].value}%26current=${ReformsIds[0].value}" target="_blank">
                  <span class="tooltiptext">Compartir</span>  
                  <img style="margin-right: 10px;" src="https://firebasestorage.googleapis.com/v0/b/elboe-es.appspot.com/o/twitter.png?alt=media&token=28300ebc-2aa3-44ac-8229-b42919a28eb6" width="25px">
                </a>
                <a class="tooltip" onclick="navigator.clipboard.writeText('https://elboe.es/comparator?art=${articleId}&id=${urlId}&prev=${ReformsIds[1].value}&current=${ReformsIds[0].value}');alert('Enlace copiado!')">
                  <span class="tooltiptext">Copiar</span>    
                  <img style="cursor: pointer;" src="https://firebasestorage.googleapis.com/v0/b/elboe-es.appspot.com/o/copiar.png?alt=media&token=59940072-6a0c-4176-a843-3a2041c036a7" width="25px">
                </a>
              </div>
              <div style="margin-left: 15px; margin-bottom: 15px; height: 20px; white-space: nowrap;overflow: hidden;text-overflow: ellipsis; color: #912600; font-weight: bold;">${articleTitle}</div>
              <div style="margin-top: 15px;"><div style="float: left;width: 48%; color: #912600; margin-left: 15px;">${ReformsIds[0].label}</div><div style="float: right;width: 48%;">${selectTagString}</div></div>
              <div style="padding: 10px;padding-top: 50px;">
                <div style="height: 450px; overflow-y: scroll;">    
                  <div id="newHTML" style="width: 48%; float: left; padding: 10px; background-color: white; border-radius: 5px;"><div>${htmlDiffResult}</div></div>
                  <div id="originalHTML" style="width: 48%; padding: 10px; float: right; background-color: white; border-radius: 5px;"><div>${reformSelectedTemplate}</div></div>
                </div>
              </div>
            </div>`;
            document.body.appendChild(popup_reforms);
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
              document.getElementById('spinner_loading').remove();
              eventId.target.disabled = false;
          }
        });
  
      }
  
    }
  }
  init();
}
