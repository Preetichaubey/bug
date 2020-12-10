<?php session_start();
include($_SERVER['DOCUMENT_ROOT'] . '/quiztest/web/header.php');
include($_SERVER['DOCUMENT_ROOT'] . '/quiztest/web/menu.php'); ?>

<script src="https://code.jquery.com/jquery-3.4.1.js"></script>

<style>
   .module {
      background:
         linear-gradient(rgba(0, 0, 0, 0.6),
            rgba(0, 0, 0, 0.6)),
         url(htatp://sarmicrosystems.in/quiztest/web/asset/woman_sitting.jpg);
      background-size: cover;
      width: 100%;
      height: 700px;
      /*margin: 10px 0 0 10px;*/
      position: relative;
      float: left;
   }

   .heading h2 {
      font-family: 'Roboto', sans-serif;
      font-weight: 900;
      color: white;
      text-transform: uppercase;
      margin: 0;
      position: absolute;
      top: 50%;
      left: 50%;
      font-size: 2rem;
      transform: translate(-50%, -50%);
   }

   .flex {
      display: flex;
      justify-content: center;
   }

   .login_link span a {
      color: red;
   }
</style>

<div class="banner">
   <div class="module">
      <h2 class="heading">Play With Artificial Intelligence</h2>
   </div>
</div>
<div class="custom_margin"></div>

<?
if (isset($_SESSION['userid'])) { ?>
   <div class="container">
      <div class="form-group">
         <label for="exampleFormControlSelect1">Select Subject</label>
         <select class="form-control" id="subject">
            <option>Select</option>
            <?
            $std = $_SESSION['std'];
            $url = 'https://sarmicrosystems.in/quiztest/api/get_subject.php';
            $data = array('std' => $std);

            // use key 'http' even if you send the request to https://...
            $options = array(
               'http' => array(
                  'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
                  'method'  => 'POST',
                  'content' => http_build_query($data)
               )
            );
            $context  = stream_context_create($options);
            $result = file_get_contents($url, false, $context);
            if ($result === FALSE) {
               echo '0';
            } else {
               $result = json_decode($result);
               for ($i = 0; $i < sizeof($result); $i++) { ?>
                  <option id="<? echo $result[$i]->id; ?>"><? echo $result[$i]->sub; ?> </option>
            <? }
            } ?>
         </select>
      </div>

      <div class="form-group">
         <label for="exampleFormControlSelect1">Select Topic</label>
         <select class="form-control" id="topics">

         </select>
      </div>

      <div class="form-group">
         <label for="exampleFormControlSelect1">Level</label>
         <select class="form-control" id="ai_type" name="ai_type">
            <option name="1">I am 100% accurate</option>
            <option name="2">I am correct most of the time</option>
            <option name="3">I am fast but make mistakes</option>
            <option name="4">I am unpredictable</option>
         </select>
      </div>

      <!--quiz.php-->
      <div class="flex">
         <a href="#" id="start" class="btn btn-primary">Start</a>
      </div>

      <div class="custom_margin"></div>

      <? } else { ?>
      <div class="container">
         <h4 class="login_link">
            Please <span><a href="https://sarmicrosystems.in/quiztest/web/account/">Login</a></span> to continue
         </h4>
      </div>
      <? } ?>
   </div>
   <script>
        $("#subject").change(function() {
            $("#topics option").remove();
            var id = $(this).children(":selected").attr("id");
            if (id) {
               // alert(id);
               $.ajax({
                  type: "POST",
                  url: 'https://sarmicrosystems.in/quiztest/api/get_topics.php',
                  data: 'sub=' + id,
                  success: function(msg) {
                     for (i = 0; i < msg.length; i++) {
                        //$('#topics').append(new Option(msg[i]['name'], msg[i]['id']));
                        $('#topics').append($('<option>', {
                           text: msg[i]['name'],
                           value: msg[i]['id']
                        }));
                     }
                  }
               });
            }
         });

         $(document).ready(function() {
            $('#start').click(function() {
               var subid = $('#subject').children(":selected").attr("id");
               var topicid = $('#topics').children(":selected").attr("id");
               var ai_type = $('#ai_type').children(":selected").attr("name");
               if(!(+subid>=1)){
                  alert("Please select subject.");
                  return 0;
               } else if(!(+topicid >= 1)){
                  alert("Please select topic.");
                  return 0;
               }
               localStorage.setItem("subid",subid);
               localStorage.setItem("topics",topicid);
               localStorage.setItem("AgainstId","1");
               localStorage.setItem("LevelId",ai_type);

               console.log('subid: ' + subid + ', topicid: ' + topicid + ', ai_type: ' + ai_type);

               $.ajax({
                  type: "POST",
                  url: 'https://sarmicrosystems.in/quiztest/web/quiz/setvalues.php',
                  data: 'subjectid=' + subid + "&topicid=" + topicid + "&ai_type=" + ai_type,
                  success: function(msg) {
                     console.log(msg);
                     if (msg == 1) {
                        window.location.href = "https://sarmicrosystems.in/quiztest/web/quiz/quiz.php";
                        alert('set');
                     } else {
                        alert('not set');
                     }
                  }
               });
            });

            $('a[href=#]').click(function(e) {
               e.preventDefault();
            });
         });
   </script>
   <?php include($_SERVER['DOCUMENT_ROOT'] . '/quiztest/web/footer.php'); ?>