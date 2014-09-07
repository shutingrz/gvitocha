require 'net/http'

url = URI.parse('http://192.168.56.103:8022/')
req = Net::HTTP::Get.new("/u?s=358550294&jid=18&w=80&h=24&k=")
res = Net::HTTP.start(url.host, url.port) {|http|
  http.request(req)
}

sleep(1)

puts res.body

