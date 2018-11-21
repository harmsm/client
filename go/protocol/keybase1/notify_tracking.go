// Auto-generated by avdl-compiler v1.3.28 (https://github.com/keybase/node-avdl-compiler)
//   Input file: avdl/keybase1/notify_tracking.avdl

package keybase1

import (
	"github.com/keybase/go-framed-msgpack-rpc/rpc"
	context "golang.org/x/net/context"
)

type TrackingChangedArg struct {
	Uid        UID    `codec:"uid" json:"uid"`
	Username   string `codec:"username" json:"username"`
	IsTracking bool   `codec:"isTracking" json:"isTracking"`
}

type NotifyTrackingInterface interface {
	TrackingChanged(context.Context, TrackingChangedArg) error
}

func NotifyTrackingProtocol(i NotifyTrackingInterface) rpc.Protocol {
	return rpc.Protocol{
		Name: "keybase.1.NotifyTracking",
		Methods: map[string]rpc.ServeHandlerDescription{
			"trackingChanged": {
				MakeArg: func() interface{} {
					var ret [1]TrackingChangedArg
					return &ret
				},
				Handler: func(ctx context.Context, args interface{}) (ret interface{}, err error) {
					typedArgs, ok := args.(*[1]TrackingChangedArg)
					if !ok {
						err = rpc.NewTypeError((*[1]TrackingChangedArg)(nil), args)
						return
					}
					err = i.TrackingChanged(ctx, typedArgs[0])
					return
				},
			},
		},
	}
}

type NotifyTrackingClient struct {
	Cli rpc.GenericClient
}

func (c NotifyTrackingClient) TrackingChanged(ctx context.Context, __arg TrackingChangedArg) (err error) {
	err = c.Cli.Notify(ctx, "keybase.1.NotifyTracking.trackingChanged", []interface{}{__arg})
	return
}
