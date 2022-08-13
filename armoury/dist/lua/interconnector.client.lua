--[[
    Q: Why does this file exist?
    A: Javascript's setTick is about 5 times slower than Lua's counterpart `while inside Citizen.CreateThread`.
       In order to maintain good performance inside the resource monitor, we are using the lua option for
       action points.
       (Better documented here: https://github.com/citizenfx/fivem/issues/1653)
]]--

Citizen.CreateThread(function()
    while true do
        TriggerEvent("armoury:thread-triggerer", "chunk-checker")
        Citizen.Wait(1000)
    end
end)